// Map

function Map() {
	var self = this;

	self.width = 0x10;
	self.height = 0x10;

	self.data = [];
	self.data.length = self.width*self.height;

	for(var i = 0; i < self.data.length; ++i) {
		self.data[i] = Math.floor(2*Math.random());
	}
}

var map = new Map();

var Entity = require('./public/entity.js').Entity;

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
	EntityUpdate: function(entity) {
		this.type = 'EntityUpdate';
		this.id = entity.id;
		// ...
	},
	EntityMove: function(entity) {
		this.type = 'EntityMove';
		this.id = id;
		this.pos = pos;
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
		if(client && predicate && predicate(client)) {
			client.send(pack);
		}
	}
}

function Client(websocket) {

	var self = this;

	self.websocket = websocket;

	self.open = function() {
		self.id = addClient(self);
		self.entity = new Entity(self.id, {x: map.width*Math.random(), y: map.height*Math.random()});

		self.send(new Msg.MapInfo({x: map.width, y: map.height}));
		self.send(new Msg.ChunkUpdate({x: 0, y: 0}, {x: map.width, y: map.height}, map.data));
		for(var i = 1; i < clients.length; ++i) {
			var client = clients[i];
			if(client) {
				self.send(new Msg.EntityCreate(client.entity));
			}
		}

		var newId = self.id;
		broadcast(new Msg.EntityCreate(self.entity), function(client) {return client.id != newId});

		console.log('open ' + self.id);
	}

	self.close = function(code, message) {
		removeClient(self.id);
		broadcast(new Msg.EntityDestroy(self.id));
		console.log('close: ' + code + ' ' + message);
	}

	self.receive = function(message, flags) {
		if(flags.binary) {
			console.log('receive binary data');
		} else {
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