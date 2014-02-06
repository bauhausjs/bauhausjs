var express    = require('express');

module.exports = function setup(options, imports, register) {
    var api = imports.api.app,
        frontend = imports.frontend.app,
        backend = imports.backend;

    var plugin = { 
        app: {},
        documents: {},
        client: {
            js: [__dirname + '/client/**/*.js'],
            html: [__dirname + '/client/**/*.html'],
            modules: ['bauhaus.document'] 
        },
        addType: function (name, config) {
            this.documents[name] = config;
        }
    };

    api.get('/Documents', function (req, res, next) {
        res.json(plugin.documents);
    });


    // REGISTER client assets
    backend.build.addSrc('js', plugin.client.js);
    backend.build.addSrc('html', plugin.client.html);
    backend.build.addModule(plugin.client.modules);

    register(null, {
        document: plugin
    });
};