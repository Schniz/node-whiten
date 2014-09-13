var express = require('express');
var app = express();
var Sinopia = require('./models/sinopia');
var uuid = require('node-uuid');
var fs = require('fs');

module.exports = app;

app.get('/', function(req, res) {
	res.status(200).send("hello world");
});

app.get('/download/:package.zip', function(req, res) {
	var sinopia = new Sinopia(uuid.v4());
	sinopia.start(function() {
		sinopia.install(req.params.package, function() {
			sinopia.pipeZip(res);
			res.on('close', function() {
				sinopia.stop();
			});
		});
	});
});
