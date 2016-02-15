function App() {
	var self = this;

	self.websocket = null;

	self.canvas = null;

	self.width = 300;
	self.height = 150;

	self.map = null;

	self.entities = {};
	self.player = null;
	self.playerInfo = {
		moved: false
	};

	self.init = function() {
		self.canvas = document.getElementById('canvas_main');
		self.cam = new Camera(self.canvas);

		self.websocket = openWebSocket();
		self.websocket.onopen = function(event) {
			console.log('open');
		};
		self.websocket.onclose = function(event) { 
			console.log('close');
		};
		self.websocket.onmessage = function(event) {
			console.log(event.data);
			var pack = JSON.parse(event.data);
			switch(pack.type) {

				case 'MapInfo':
				self.map = new Map(pack.size);
				self.cam.pos = Vec2.mul(pack.size, -0.5);
				break;

				case 'ChunkUpdate':
				for(var iy = 0; iy < pack.size.y; ++iy) {
					for(var ix = 0; ix < pack.size.x; ++ix) {
						var pos = Vec2.add(Vec2.create(ix, iy), pack.pos);
						var block = pack.data[iy*pack.size.x + ix];
						self.map.set(pos, block);
					}
				}
				break;

				case 'BlockUpdate':
				self.map.set(pack.pos, pack.block)
				break;

				case 'EntityCreate':
				self.entities[pack.id] = new Entity(pack.id, pack.pos, pack.size);
				break;

				case 'EntityDestroy':
				delete self.entities[pack.id];
				if(pack.id == self.player.id)
					self.player = null;
				break;

				case 'EntityBind':
				self.player = self.entities[pack.id];
				break;

				case 'EntityUpdate':
				// ...
				break;

				case 'EntityMove':
				self.entities[pack.id].pos = pack.pos;
				break;
			}
		};

		self.initInput();
		self.resize();

		var solvePeriod = 40;
		self.solveInterval = setInterval(function() {
			self.solve(solvePeriod);
		}, solvePeriod);

		var reportPeriod = 100;
		self.reportInterval = setInterval(function() {
			self.report(reportPeriod);
		}, reportPeriod);

		window.requestAnimationFrame(self.render);
	};

	self.resize = function() {
		self.width = $(window).width();
		self.height = $(window).height();

		self.canvas.width = self.width;
		self.canvas.height = self.height;

		console.log("[info] resize {" + self.width + ", " + self.height + "}");
	};

	self.cam = null;

	self.render = function(ts) {
		var cnv = self.canvas;
		var ctx = cnv.getContext('2d');
		var cam = self.cam;

		ctx.clearRect(0, 0, cnv.width, cnv.height);

		var map = self.map;
		if(map) {
			for(var iy = 0; iy < map.size.y; ++iy) {
				for(var ix = 0; ix < map.size.x; ++ix) {
					ctx.fillStyle = map.get(Vec2.create(ix, iy)) > 0 ? 'rgba(0,128,0,1.0)' : 'rgba(0,0,0,0.0)';
					var pos = cam.wsa(Vec2.create(ix, iy)), size = cam.wsr(Vec2.create(1));
					ctx.fillRect(pos.x, pos.y, size.x, size.y);
				}
			}
		}

		var entities = self.entities;
		for(var id in self.entities) {
			var entity = entities[id];
			ctx.fillStyle = 'rgb(128,0,0)';
			var pos = cam.wsa(Vec2.sub(entity.pos, Vec2.mul(entity.size, 0.5))), size = cam.wsr(entity.size);
			ctx.fillRect(pos.x, pos.y, size.x, size.y);
		}
		
		window.requestAnimationFrame(self.render);
	}

	self.solve = function (ms) {
		var player = self.player;
		if(player) {
			var input = self.input;
			if(input.right - input.left != 0 || input.up - input.down != 0) {
				player.pos = Vec2.add(player.pos, Vec2.mul(Vec2.create(input.right - input.left, input.up - input.down), 4*0.001*ms));
				self.playerInfo.moved = true;
			}
		}
	}
	self.solveInterval = null;

	self.report = function (ms) {
		var player = self.player;
		var playerInfo = self.playerInfo;
		if(player) {
			if(playerInfo.moved) {
				var pack = {
					type: 'PlayerMove',
					pos: player.pos
				};
				self.websocket.send(JSON.stringify(pack));
				playerInfo.moved = false;
			}
		}
	}
	self.reportInterval = null;

	self.input = {
		up: 0,
		down: 0,
		left: 0,
		right: 0
	};

	self.initInput = function() {
		var input = self.input;
		function getKeys(mode, key) {

			var value = 0;
			if(mode == 'down')
				value = 1;

			switch(key) {
				case 87:
				input.up = value;
				break;
				case 65:
				input.left = value;
				break;
				case 83:
				input.down = value;
				break;
				case 68:
				input.right = value;
				break;
			}
		}
		window.onkeydown = function(e) {
			getKeys('down', e.keyCode);	
		};
		window.onkeyup = function(e) {
			getKeys('up', e.keyCode);
		};
		window.onblur = function(e) {
			self.input.up = 0;
			self.input.down = 0;
			self.input.left = 0;
			self.input.right = 0;
		}
	}
}

var app = new App();

$(window).resize(app.resize);
$(document).ready(app.init);
