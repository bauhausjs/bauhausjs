var express = require('express'),
    passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    registerModels = require('./model'),
    registerMiddleware = require('./middleware'),
    registerApi = require('./api'),
    debug = require('debug')('bauhaus:security');

module.exports = function setup(options, imports, register) {
    var mongoose = imports.mongoose.mongoose;

    var plugin = {
        passport: passport,
        helper: {},
        models: {},
        api: null,
        middleware: {},
        client: {
            js: [__dirname + '/client/**/*.js'],
            html: [__dirname + '/client/**/*.html'],
            modules: ['bauhaus.user', 'bauhaus.role']
        },
        permissions: {},
        addPermission: function (pluginName, permissions) {
            this.permissions[pluginName] = permissions;
        },
        customUserFields: [],
        addCustomUserField: function (fields) {
            fields = Array.isArray(fields) ? fields : [fields];
            for (var f in fields) {
                this.customUserFields.push(fields[f]);
            }
        },
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

    plugin.models = registerModels(mongoose);
    plugin.api = registerApi(mongoose, plugin);
    plugin.middleware = registerMiddleware(plugin);

    // use static authenticate method of model in LocalStrategy
    passport.use(new LocalStrategy(plugin.models.user.model.authenticate()));

    // use static serialize and deserialize of model for passport session support
    passport.serializeUser(plugin.models.user.model.serializeUser());
    passport.deserializeUser(plugin.models.user.model.deserializeUser());

    register(null, {
        security: plugin
    });
};
