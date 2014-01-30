var express    = require('express');

module.exports = function setup(options, imports, register) {
    var backend = imports.backend.app,
        frontend = imports.frontend.app;

    var module = { 
        app: {},
        documents: {}
    };

    backend.get('/api/Documents', function (req, res, next) {
        res.json(module.documents);
    });

    register(null, {
        document: module
    });
};