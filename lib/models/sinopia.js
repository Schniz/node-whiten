var sinopia = require('sinopia/lib');
var yaml = require('js-yaml');
var sinopiaConfigGen = require('sinopia/lib/config_gen');
var shell = require('shelljs/shell');
var fs = require('fs');
var Archiver = require('archiver');
require('sinopia/lib/logger').setup([{ type: "stdout", level: "error", format: "pretty" }]);

var Sinopia = module.exports = function(subdomain) {
	this.subdomain = subdomain;
};

Sinopia.prototype.stop = function(callback) {
	if (this._listener) {
		return this._listener.close(function() {
			this._listener = null;
			callback.call(this);
		}.bind(this));
	}

	callback.call(this);
};

Sinopia.prototype.install = function(module, callback) {
	shell.cd(this.tmpDir());
	shell.exec("npm install --registry=" + this.url() + " " + module, { silent: true }, function(err, res) {
		shell.rm('-rf', this.tmpDir() + "/node_modules");
		callback.call(this, res);
	}.bind(this));
};

Sinopia.prototype.makeStorageZip = function() {
	var output = fs.createWriteStream(this.tmpDir() + '/output.zip');
	var archive = Archiver.createZip();

	archive.pipe(output);
	archive.bulk([{
		expand: true,
		cwd: this.storageDir(),
		src: ["**"],
		dest: 'storage/'
	}]).finalize();

	return output;
};

Sinopia.prototype.createTempDir = function() {
	shell.rm('-rf', this.tmpDir());
	shell.mkdir(this.tmpDir());
};

Sinopia.prototype.storageDir = function() {
	return this.tmpDir() + "/storage";
};

Sinopia.prototype.configJson = function() {
	var config = yaml.load(sinopiaConfigGen().yaml);
	config.listen = this.listenAddress();
	config.storage = this.storageDir();

	return config;
};

Sinopia.prototype.start = function(callback) {
	this.stop(function() {
		this.createTempDir();
		this._listener = sinopia(this.configJson()).listen(this.port, this.listenAddress().split(":")[0], callback.bind(this));
	});
};


Sinopia.prototype.port = 6661;

Sinopia.prototype.url = function() {
	return "http://" + this.listenAddress();
};

Sinopia.prototype.configFilePath = function() {
	return this.tmpDir() + "/config.yaml";
};

Sinopia.prototype.listenAddress = function() {
	return this.subdomain + ".whiten.node:" + this.port;
};

Sinopia.prototype.tmpDir = function() {
	return shell.tempdir() + "/node-whiten-" + this.subdomain;
};
