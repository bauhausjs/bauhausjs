
var express = require('express'),
    helper = require('./helper');
    debug = require('debug')('bauhaus:server'),
    appdebug = require('debug')('bauhaus:app');

module.exports = function setup(options, imports, register) {    
    var app = express(),
        event = imports.event.emitter;

    var port = options.port || 3000,
        welcome = (typeof options.welcome === 'boolean') ? options.welcome : true; 

    event.on('modules.loaded', function () {
        if (welcome) helper.logWelcome(app); 
        // listen to port as soon as all modules are loaded
        app.listen(port);
        appdebug("All modules loaded.");
        appdebug("Server started at http://0.0.0.0:" + port)
    });

    register(null, {
        server: { app: app },
    });
};
