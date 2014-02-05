var express    = require('express');

module.exports = function setup(options, imports, register) {
    var backend = imports.backend.app,
        frontend = imports.frontend.app;

    var plugin = { 
        app: {},
        documents: {},
        addType: function (name, config) {
            this.documents[name] = config;
        }
    };

    backend.get('/api/Documents', function (req, res, next) {
        res.json(module.documents);
    });

    register(null, {
        document: plugin
    });
};