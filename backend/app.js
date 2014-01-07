var express = require('express'),
    grunt = require('grunt');

module.exports = function setup(options, imports, register) {
    var app = express();
    var server = imports.server.app;
    var route = typeof options.route === 'string' ? options.route : '/backend';

    app.configure('development', function () {
        process.chdir(__dirname);
        var gruntConfig = require('./Gruntfile');
        gruntConfig(grunt);
        grunt.tasks(['default', 'watch']);
        app.use(require('connect-livereload')({ port: 35729 }));
    });

    app.use(express.static(__dirname + '/public'));

    // replace by including files compiled to public/ later
    app.use(express.static(__dirname + '/client'));
    app.get('/', function (req, res) {
        res.render(__dirname + '/templates/index.ejs', { env: process.env.NODE_ENV });
    });

    server.use(route, app);

    register(null, {
        backend: { app: app },
    });
};