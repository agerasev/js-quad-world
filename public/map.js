function Map(w, h) {
	var self = this;

	self.width = w;
	self.height = h;
	self.data = [];
	self.data.length = self.width*self.height;
}