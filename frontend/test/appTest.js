var assert = require('assert');
var app = require('../app');



describe('frontend module', function () {
    it('should expose an express server', function (done) {
        var addedToServer = false;
        var serverMock = {
            use: function () {
                addedToServer = true;
            }
        };
        var securityMock = {
            passport: {
                initialize: function () { return function (req, res, next) { return next(); } },
                session: function () { return function (req, res, next) { return next(); } },
                authenticate: function () { return function (req, res) {} }
            }
        };
        var register = function (err, services) {
            assert(err === null, "App should not return error");
            assert(services.frontend.app.stack, "App should be instance of express (and have prop stack)");
            assert(services.frontend.app.router, "App should be instance of express (and have prop router)");
            assert(addedToServer, "Frontend should be added to server");
            done();
        };
        // init module with empty options and mocked server import
        var imports = {server: {app: serverMock}, security: securityMock };
        app({}, imports, register);
    });
});