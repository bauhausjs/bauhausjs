var assert = require('assert'),
    app = require('../app')
    emitter = require('events').EventEmitter;

describe('event module', function () {
    it('should expose an EventEmitter', function (done) {
        var addedToServer = false;
        var serverMock = {
            use: function () {
                addedToServer = true;
            }
        };
        var register = function (err, services) {
            assert(err === null, "App should not return error");
            assert(services.event.emitter instanceof emitter, "Should contain EventEmitter");
            done();
        };
        // Init module
        app({}, {}, register);
    });
});