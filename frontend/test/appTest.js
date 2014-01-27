var assert = require('assert'),
    app = require('../app')
    mongoose = require('mongoose');



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
        if (!mongoose.connection.host) {
            var connection = 'mongodb://localhost/bauhausjs_test';
            mongoose.connect(connection);
        }
        var imports = {server: {app: serverMock}, security: securityMock, mongoose: { connection: mongoose.connection } };
        app({}, imports, register);
    });
});