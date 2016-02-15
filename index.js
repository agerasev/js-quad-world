// Vectors

var Vec2 = require('./public/vec2.js').Vec2;

// Entity

var Entity = require('./public/entity.js').Entity;

// Map

var Map = require('./public/map.js').Map;

var map = new Map({x: 0x10, y: 0x10});
for(var i = 0; i < map.data.length; ++i) {
	map.data[i] = Math.floor(2*Math.random());
}

// Messages

var Msg = {
	MapInfo: function (size) {
		this.type = 'MapInfo';
		this.size = size;
	},
	ChunkUpdate: function(pos, size, data) {
		this.type = 'ChunkUpdate';
		this.pos = pos;
		this.size = size;
		this.data = data;
	},
	BlockUpdate: function(pos, block) {
		this.type = 'BlockUpdate';
		this.pos = pos;
		this.block = block;
	},
	EntityCreate: function(entity) {
		this.type = 'EntityCreate';
		this.id = entity.id;
		this.pos = entity.pos;
		this.size = entity.size;
	},
	EntityDestroy: function(id) {
		this.type = 'EntityDestroy';
		this.id = id;
	},
	EntityBind: function(entity) {
		this.type = 'EntityBind';
		this.id = entity.id;
	},
	EntityUpdate: function(entity) {
		this.type = 'EntityUpdate';
		this.id = entity.id;
		// ...
	},
	EntityMove: function(entity) {
		this.type = 'EntityMove';
		this.id = entity.id;
		this.pos = entity.pos;
	}
};

// Clients

var clients = [null];

function addClient(client) {
	for(var i = 1; i < clients.length; ++i) {
		if(!clients[i]) {
			clients[i] = client;
			return i;
		}
	}
	var l = clients.length;
	clients.length++;
	clients[l] = client;
	return l;
}

function removeClient(id) {
	clients[id] = null;
}

function broadcast(pack, predicate) {
	for(var i = 1; i < clients.length; ++i) {
		var client = clients[i];
		if(client && (!predicate || predicate(client))) {
			client.send(pack);
		}
	}
}

function Client(websocket) {

	var self = this;

	self.websocket = websocket;

	self.open = function() {
		self.id = addClient(self);
		self.entity = new Entity(self.id, Vec2.mulv(map.size, Vec2.create(Math.random(), Math.random())));

		self.send(new Msg.MapInfo(map.size));
		self.send(new Msg.ChunkUpdate(Vec2.create(), map.size, map.data));
		for(var i = 1; i < clients.length; ++i) {
			var client = clients[i];
			if(client) {
				self.send(new Msg.EntityCreate(client.entity));
			}
		}
		self.send(new Msg.EntityBind(self.entity));

		var _id = self.id;
		broadcast(new Msg.EntityCreate(self.entity), function(client) {return client.id != _id});

		console.log('open ' + self.id);
	}

	self.close = function(code, message) {
		var _id = self.id;
		broadcast(new Msg.EntityDestroy(self.id), function(client) {return client.id != _id});
		removeClient(self.id);
		console.log('close ' + self.id + ': ' + code + ' ' + message);
	}

	self.receive = function(message, flags) {
		if(flags.binary) {
			console.log('receive binary data');
		} else {
			var pack = null;
			try {
				pack = JSON.parse(message);
			} catch(e) {
				console.err('parse error: ' + e);
			}

			if(pack) {
				switch(pack.type) {
					case 'PlayerMove': {
						self.entity.pos = pack.pos;
						var _id = self.id;
						broadcast(new Msg.EntityMove(self.entity), function(client) {return client.id != _id});
					} break;
				}
			}

			console.log('receive: ' + message);
		}
	}

	self.error = function(error) {
		console.log('error: ' + error);
	}

	self.send = function(pack) {
		self.websocket.send(JSON.stringify(pack));
	}

	self.entity = null;
}

// Export

module.exports.Client = Client;