function App() {
	var self = this;

	self.websocket = null;

	self.canvas = null;

	self.width = 300;
	self.height = 150;

	self.map = null;

	self.init = function() {
		self.canvas = document.getElementById('canvas_main');

		self.websocket = openWebSocket();
		self.websocket.onopen = function(event) {
			console.log('open');
		};
		self.websocket.onclose = function(event) { 
			console.log('close');
		};
		self.websocket.onmessage = function(event) {
			console.log(event.data);
		};

		self.resize();
	};

	self.resize = function() {
		self.width = $(window).width();
		self.height = $(window).height();

		self.canvas.width = self.width;
		self.canvas.height = self.height;

		console.log("[info] resize {" + self.width + ", " + self.height + "}");
	};
}

var app = new App();

$(window).resize(app.resize);
$(document).ready(app.init);
