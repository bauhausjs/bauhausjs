var express = require('express'),
    flash = require('connect-flash'),
    session = require('connect-mongo')(express);

module.exports = function setup(options, imports, register) {
    var app = express();
    var server = imports.server.app,
        security = imports.security,
        mongoose = imports.mongoose;

    // currently middleware is added statically
    app.use(express.cookieParser());
    app.use(express.json());
    app.use(express.urlencoded());
    app.use(express.session({
        store: new session({ mongoose_connection: mongoose.connection }),
        secret: security.sessionSecret, 
        path: '/',
        maxAge: 100 * 60 * 60 * 24
    }));
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