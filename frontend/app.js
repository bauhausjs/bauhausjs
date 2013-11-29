var express = require('express');

module.exports = function setup(options, imports, register) {
    var app = express();
    var server = imports.server.app;

    server.use(app);

    register(null, {
        frontend: { app: app },
    });
};