var express = require('express'),
    flash = require('connect-flash');

module.exports = function setup(options, imports, register) {
    var app = express();
    var server = imports.server.app,
        security = imports.security;

    // currently middleware is added statically
    app.use(express.cookieParser());
    app.use(express.json());
    app.use(express.urlencoded());
    app.use(express.session({ secret: 'dynamize this secret' }));
    app.use(flash());
    app.use(security.passport.initialize());
    app.use(security.passport.session());
    app.use(app.router);

    // POST Login endpoint
    app.post('/login',
        security.passport.authenticate('local', { successRedirect: '/',
                                         failureRedirect: '/login',
                                         failureFlash: true })
    );

    // add frontend to server
    server.use(app);

    register(null, {
        frontend: { app: app },
    });
};