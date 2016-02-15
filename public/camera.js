var Camera = function(cnv, pos, mag) {
	var self = this;
	self.cnv = cnv;
	self.pos = pos || {x: 0.0, y: 0.0};
	self.mag = mag || 40.0;

	// world to screen coords conversion: absolute and relative
	self.wsa = function(wp) {
		return {x: 0.5*self.cnv.width + self.mag*(self.pos.x + wp.x), y: 0.5*self.cnv.height - self.mag*(self.pos.y + wp.y)};
	},
	self.wsr = function(ws) {
		return {x: self.mag*ws.x, y: -self.mag*ws.y};
	},

	// screen to world coords conversion: absolute and relative
	self.swa = function(sp) {
		return {x: (sp.x - self.pos.x)/self.mag - 0.5*self.cnv.width, y: -(sp.y - self.pos.y)/self.mag - 0.5*self.cnv.height};
	},
	self.swr = function(ss) {
		return {x: ss.x/self.mag, y: -ss.y/self.mag};
	}
}