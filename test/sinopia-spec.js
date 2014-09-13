var expect = require('chai').expect;
var request = require('request');
var Sinopia = require('../lib/models/sinopia');
var fs = require('fs');
var sampleApp = require('express')();

describe("Sinopia", function() {
	before(function(done) {
		sampleApp.listen(6661, "0.0.0.0", function() {
			sampleApp.customConfig = { host: "localhost", port: 6661 };
			this.sinopia = new Sinopia("schnizHagever", sampleApp);
			done();
		}.bind(this));

		sampleApp.get("/", function(req, res) { return res.send("welcome!"); });
	});

	it("should produce a good url", function() {
		expect(this.sinopia.url()).to.equal("http://localhost:6661/sandbox/schnizHagever");
	});

	it("should produce a good tmp dir", function() {
		expect(this.sinopia.tmpDir()).to.equal("/tmp/node-whiten-schnizHagever");
	});

	describe("http server", function() {
		before(function() {
			this.sinopia.handle();
		});

		it("should be a simple http server", function(done) {
			request.get("http://localhost:6661", function(err, res, body) {
				expect(res.statusCode).to.equal(200);
				expect(body).to.equal("welcome!");
				done();
			});
		});

		it("should be a middleware when starting", function(done) {
			this.timeout(5000);
			request.get(this.sinopia.url() + "/express/latest", function(err, res, body) {
				expect(res.statusCode).to.equal(200);
				done();
			});
		});

		it("should be able to close itself", function(done) {
			this.sinopia.kill();
			request.get(this.sinopia.url() + "/express/latest", function(err, res, body) {
				expect(res.statusCode).to.equal(404);
				done();
			});
		});

		it("should be able to be up and down and up and down..", function(done) {
			this.timeout(5000);
			this.sinopia.kill();
			this.sinopia.handle();
			this.sinopia.kill();
			this.sinopia.handle();

			request.get(this.sinopia.url() + "/express/latest", function(err, res, body) {
				expect(res.statusCode).to.equal(200);
				done();
			});
		});
	});

	describe("installing in sandbox", function() {
		before(function() {
			this.sinopia.handle();
		});
		after(function() {
			this.sinopia.kill();
		});

		it("should install express and its dependencies via this sinopia instance", function(done) {
			this.timeout(15000);

			var sinopia = this.sinopia;
			sinopia.install("express", function() {
				var installed = fs.readdirSync(sinopia.storageDir());
				expect(installed).to.include("express");
				done();
			});
		});

		it("should create an output.zip file in the tmp dir", function(done) {
			var sinopia = this.sinopia;
			sinopia.makeStorageZip().on('close', function() {
				expect(fs.readdirSync(sinopia.tmpDir())).to.include("output.zip");
				done();
			});
		});
	});
});
