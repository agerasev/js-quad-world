module.exports.Events = {
	PlayerCreate: function(id, entity) {
		this.type = 'PlayerCreate';
		this.id = id;
		this.entity = entity;
	},
	PlayerDestroy: function(id) {
		this.type = 'PlayerDestroy';
		this.id = id;
	},
	PlayerMove: function(id, pos) {
		this.type = 'PlayerMove';
		this.id = id;
		this.pos = pos;
	}
};

module.exports.Bus = function () {
	var self = this;
	self.listener = null;
	self.subscribe = function (listener) {
		self.listener = listener;
	}
	self.emit = function(event) {
		self.listener(event);
	}
	// TODO: use mongodb tailable cursor 
	// for scalable applications
};
