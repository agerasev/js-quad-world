var Entity = function(id, pos, size) {
	var self = this;
	self.id = id;
	self.pos = pos || {x: 0.0, y: 0.0};
	self.size = size || {x: 0.8, y: 1.6};
}

module.exports.Entity = Entity;
