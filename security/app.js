var express = require('express'),
    passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    models = require('./model'),
    middleware = require('./middleware'),
    debug = require('debug')('bauhaus:security');

module.exports = function setup(options, imports, register) {
    var security = {
        passport: passport,
        helper: {},
        models: models,
        middleware: middleware,
        permissions: {},
        sessionSecret: (options.sessionSecret) ? options.sessionSecret : 'nov9t4ho3ivuth384nct9n'
    };

    passport.use(new LocalStrategy(
        function(username, password, done) {
            models.user.findOne({ username: username }, function (err, user) {
                if (err) { return done(err); }
                if (!user) {
                    return done(null, false, { message: 'Incorrect username.' });
                }
                if (!user.validPassword(password)) {
                    return done(null, false, { message: 'Incorrect password.' });
                }
              return done(null, user);
            });
        }
    ));

    var permissionsApi = express();
    permissionsApi.get('/Permissions', function (req, res, next) {
        res.send(security.permissions)
    });
    security.models.permission = { api: permissionsApi };

    // use static authenticate method of model in LocalStrategy
    passport.use(new LocalStrategy(models.user.model.authenticate()));

    // use static serialize and deserialize of model for passport session support
    passport.serializeUser(models.user.model.serializeUser());
    passport.deserializeUser(models.user.model.deserializeUser());

    register(null, {
        security: security
    });
};
