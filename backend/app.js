var express = require('express');

module.exports = function setup(options, imports, register) {
    var app = express();
    var server = imports.server.app;
    var route = typeof options.route === 'string' ? options.route : '/backend';

    app.get('/', function (req, res) {
        res.send("Welcome to backend")
    });
    server.use(route, app);

    register(null, {
        backend: { app: app },
    });
};