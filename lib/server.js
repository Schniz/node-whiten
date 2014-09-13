var express = require('express');
var app = express();
var Sinopia = require('./models/sinopia');
var uuid = require('node-uuid');
var fs = require('fs');

module.exports = app;

app.use(express.static(__dirname + "/../public"));

var packagesArrayFromString = function(whitespaceDelimitedString) {
	return whitespaceDelimitedString.split(" ").filter(function(package) {
		return package.indexOf("-") !== 0 && package.indexOf(".") !== 0 && package.indexOf("_") !== 0;
	});
};

app.get('/download/:packages.zip', function(req, res) {
	var packages = packagesArrayFromString(req.params.packages);
	var sinopia = new Sinopia(uuid.v4(), app);
	var handler = sinopia.handle();
	sinopia.install(packages, function() {
		sinopia.pipeZip(res);
		res.on('close', function() {
			sinopia.kill();
		});
	});
});
