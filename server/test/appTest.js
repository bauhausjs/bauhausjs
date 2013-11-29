var assert = require('assert');
var app = require('../app');

describe('server module', function () {
    it('should expose an express server', function (done) {
        var register = function (err, services) {
            assert(err === null, "App should not return error");
            assert(services.server.app.stack, "App should be instance of express (and have prop stack)");
            assert(services.server.app.router, "App should be instance of express (and have prop router)");
            done();
        };
        // init module with empty options and empty inherits
        app({}, {}, register);
    });
});