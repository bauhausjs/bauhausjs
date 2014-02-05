var express    = require('express');

module.exports = function setup(options, imports, register) {
    var api = imports.api.app,
        frontend = imports.frontend.app;

    var plugin = { 
        app: {},
        documents: {},
        addType: function (name, config) {
            this.documents[name] = config;
        }
    };

    api.get('/Documents', function (req, res, next) {
        res.json(plugin.documents);
    });

    register(null, {
        document: plugin
    });
};