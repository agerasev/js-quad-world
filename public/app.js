function App() {
	var self = this;

	self.websocket = null;

	self.canvas = null;

	self.width = 300;
	self.height = 150;

	self.map = null;

	self.entities = {};

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
				break;

				case 'EntityUpdate':
				// ...
				break;

				case 'EntityMove':
				self.entities[pack.id].pos = pack.pos;
				break;
			}
		};

		self.resize();

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
}

var app = new App();

$(window).resize(app.resize);
$(document).ready(app.init);
