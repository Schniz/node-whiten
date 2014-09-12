var expect = require('chai').expect;
var UserSession = require('../lib/models/user-session');
var Sinopia = require('../lib/models/sinopia');

describe("UserSession", function() {
	before(function() { 
		this.userSession = new UserSession("express");
	});

	it("should expose a sinopia object", function() {
		expect(this.userSession.sinopia).to.be.instanceOf(Sinopia);
	});
});
