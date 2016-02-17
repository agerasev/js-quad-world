// Vectors

var Vec2 = require('./public/vec2.js').Vec2;

var Entity = require('./public/entity.js').Entity;

var Map = require('./public/map.js').Map;

var map = new Map({x: 0x10, y: 0x10});
for(var i = 0; i < map.data.length; ++i) {
	map.data[i] = Math.floor(2*Math.random());
}


// Messages

var Msg = require('./message.js').Messages;

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

// Events

var event = require('./event.js');
var Events = event.Events;
var Bus = event.Bus;

var bus = new Bus();
bus.subscribe(function (event) {
	console.log(JSON.stringify(event));
	switch(event.type) {
		case 'PlayerCreate': {
			broadcast(new Msg.EntityCreate(event.entity), function(client) {return client.id != event.id});
		} break;
		case 'PlayerDestroy': {
			broadcast(new Msg.EntityDestroy(event.id), function(client) {return client.id != event.id});
		} break;
		case 'PlayerMove': {
			var entity = clients[event.id].entity;
			entity.pos = event.pos;
			broadcast(new Msg.EntityMove(entity), function(client) {return client.id != event.id});
		} break;
	}
});

// Client

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

		bus.emit(new Events.PlayerCreate(self.id, self.entity));

		console.log('open ' + self.id);
	}

	self.close = function(code, message) {
		removeClient(self.id);
		bus.emit(new Events.PlayerDestroy(self.id));
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
						bus.emit(new Events.PlayerMove(self.id, pack.pos));
					} break;
				}
			}

			//console.log('receive: ' + message);
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
