module.exports.Messages = {
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