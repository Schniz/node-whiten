var Sinopia = require(__dirname + '/sinopia');
var uuid = require('node-uuid');

var UserSession = module.exports = function(nodeModules) {
	this.nodeModules = nodeModules;
	this.uuid = uuid.v4();
	this.sinopia = new Sinopia(this.uuid);
};
