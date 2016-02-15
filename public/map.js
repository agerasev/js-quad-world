function Map(size) {
	var self = this;

	self.size = size;
	self.data = [];
	self.data.length = self.size.x*self.size.y;

	self.set = function(p, b) {
		self.data[p.y*self.size.x + p.x] = b;
	}

	self.get = function(p) {
		return self.data[p.y*self.size.x + p.x];
	}
}