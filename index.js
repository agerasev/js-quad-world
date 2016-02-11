// Block

function Block(type) {
	this.type = type;
}

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

// Messages

var Msg = {
	Map: function (w, h) {
		this.width = w;
		this.height = h;
	},
	Chunk: function(x, y, w, h, data) {
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
		this.data = data;
	},
	Block: function(x, y, block) {
		this.x = x;
		this.y = y;
		this.block = block;
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

function broadcast(pack) {
	for(var i = 1; i < clients.length; ++i) {
		var client = clients[i];
		if(client) {
			client.send(pack);
		}
	}
}

function Client(websocket) {

	var self = this;

	self.websocket = websocket;

	self.open = function() {
		self.id = addClient(self);
		self.send(new Msg.Map(map.width, map.height));
		self.send(new Msg.Chunk(0, 0, map.width, map.height, map.data));
		console.log('open ' + self.id);
	}

	self.close = function(code, message) {
		removeClient(self.id);
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
}

// Export

module.exports.WebSocketHandle = Client;