var expect = require('chai').expect;
var request = require('request');
var Sinopia = require('../lib/models/sinopia');
var fs = require('fs');

describe("Sinopia", function() {
	before(function() {
		this.sinopia = new Sinopia("schnizHagever");
	});

	it("should produce a good url", function() {
		expect(this.sinopia.url()).to.equal("http://schnizHagever.whiten.node:6661");
	});

	it("should produce a good tmp dir", function() {
		expect(this.sinopia.tmpDir()).to.equal("/tmp/node-whiten-schnizHagever");
	});

	describe("http server", function() {
		before(function(done) {
			this.sinopia.start(function() {
				done();
			});
		});

		it("should listen on its server when starting", function(done) {
			request.get(this.sinopia.url(), function(err, res, body) {
				expect(res.statusCode).to.equal(404);
				done();
			});
		});

		it("should be able to close itself", function(done) {
			this.sinopia.stop(function() {
				request.get(this.url(), function(err, res, body) {
					expect(err.code).to.equal("ECONNREFUSED");
					done();
				});
			});
		});
	});

	describe("installing in sandbox", function() {
		before(function(done) {
			this.sinopia.start(function() {
				done();
			});
		});
		after(function(done) {
			this.sinopia.stop(function() {
				done();
			});
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
