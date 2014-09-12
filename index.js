var app = require('./lib/server');

var port = process.env.NODE_WHITEN_PORT || process.env.PORT || 8080;
var server = process.env.NODE_WHITEN_SERVER || process.env.SERVER || '0.0.0.0';

app.listen(port, server, function() {
	console.log("Listening on " + server + ":" + port);
});
