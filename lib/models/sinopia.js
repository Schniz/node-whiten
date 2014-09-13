var sinopia = require('sinopia/lib');
var yaml = require('js-yaml');
var sinopiaConfigGen = require('sinopia/lib/config_gen');
var shell = require('shelljs/shell');
var fs = require('fs');
var Archiver = require('archiver');
require('sinopia/lib/logger').setup([{ type: "stdout", level: "error", format: "pretty" }]);

var Sinopia = module.exports = function(subdomain, app) {
	this.app = app;
	this.subdomain = subdomain;
};

Sinopia.prototype.clearDirectory = function() {
	if (fs.existsSync(this.tmpDir())) {
		shell.rm("-rf", this.tmpDir());
	}
};

Sinopia.prototype.install = function(module, callback) {
	var modules = module.forEach ? module : [module];
	shell.cd(this.tmpDir());
	shell.exec("npm install --force --registry=" + this.url() + " " + modules.join(" "), { silent: true }, function(err, res) {
		shell.rm('-rf', this.tmpDir() + "/node_modules");
		callback.call(this, res);
	}.bind(this));
};

Sinopia.prototype.makeStorageZip = function() {
	var output = fs.createWriteStream(this.tmpDir() + '/output.zip');
	this.pipeZip(output);

	return output;
};

Sinopia.prototype.pipeZip = function(pipe) {
	var archive = Archiver.createZip();
	archive.pipe(pipe);
	archive.bulk([{
		expand: true,
		cwd: this.storageDir(),
		src: ["**"],
		dest: 'storage/'
	}]).finalize();

	return archive;
};

Sinopia.prototype.createTempDir = function() {
	this.clearDirectory();
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
	config.url_prefix = this.url();

	return config;
};

Sinopia.prototype.kill = function() {
	if (!this.app || !this._listener) return;

	this._listener = null;
};

Sinopia.prototype.handle = function() {
	this.createTempDir();
	this._listener = sinopia(this.configJson());
	this.app.use(this.sandboxPath(), this.middleware.bind(this));
	return this._listener;
};

Sinopia.prototype.middleware = function(req, res, next) {
	if (this.app && this._listener) return this._listener.apply(this, Array.prototype.slice.call(arguments));
	return next();
};

Sinopia.prototype.port = 6661;

Sinopia.prototype.sandboxPath = function() {
	return "/sandbox/" + this.subdomain;
};

Sinopia.prototype.url = function() {
	return "http://" + this.listenAddress() + this.sandboxPath();
};

Sinopia.prototype.url2 = function() {
	return "http://" + this.listenAddress();
};

Sinopia.prototype.configFilePath = function() {
	return this.tmpDir() + "/config.yaml";
};

Sinopia.prototype.hostname = function() {
	return this.subdomain + ".whiten.node";
};

Sinopia.prototype.listenAddress = function() {
	return this.app.customConfig.host + ":" + this.app.customConfig.port;
};

Sinopia.prototype.tmpDir = function() {
	return shell.tempdir() + "/node-whiten-" + this.subdomain;
};
