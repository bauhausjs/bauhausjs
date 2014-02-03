var express = require('express');

module.exports = function setup(options, imports, register) {
    var app = express();
    var server = imports.server.app,
        security = imports.security;

    // MODULE
    var api = {
        app: app
    }

    var isAuthenticated = security.middleware.isAuthenticated({redirect:'/backend/login'});

    // add api to backend
    server.use('/backend/api', isAuthenticated);
    server.use('/backend/api', app);

    // Register REST API for users and permissions, since security cannot add them itself due
    // to cicular dependencies
    app.use(security.models.user.api);
    app.use(security.models.permission.api);

    register(null, {
        api: api,
    });
};