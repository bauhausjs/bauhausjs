var express = require('express'),
    Build = require('./build'),
    registerRoutes = require('./routes'),
    flash = require('connect-flash'),
    session = require('connect-mongo')(express),
    path = require('path');;

module.exports = function setup(options, imports, register) {
    var server = imports.server.app,
        security = imports.security,
        mongoose = imports.mongoose,
        event = imports.event.emitter;

    // OPTIONS   
    var route = typeof options.route === 'string' ? options.route : '/backend';

    // Init backend express app
    var app = express();
    var env = app.get('env');

    // MODULE
    // Init exposed backend object
    var plugin = {
        app: app,
        build: null,
        client: {
            modules: ['ngResource', 'ngRoute', 'slugifier', 'bauhaus.general', 'bauhaus.dashboard'],
            html: [ __dirname + '/client/javascript/**/*.html' ],
            js: [
                __dirname + '/client/components/angular/angular.js',
                __dirname + '/client/components/angular-resource/angular-resource.js',
                __dirname + '/client/components/angular-route/angular-route.js',
                __dirname + '/client/components/angular-slugify/angular-slugify.js',
                __dirname + '/client/javascript/**/*.js'
            ],
            css: [ __dirname + '/client/public/*.css' ],
            less: [ __dirname + '/client/css/all.less' ]
        }
    };



    // BUILD
    // Destination and option config of custom builder
    var buildOptions = {
        env: env,
        angular: {
            modules: []
        },
        html: {
            dest: __dirname +  '/build/client/javascript'
        },
        js: {
            dest: __dirname +  '/build/client/javascript'
        },
        css: {
            concat: 'all.css',
            dest: __dirname +  '/build/client/css'
        },
        less: {
            paths: [ __dirname + '/client/css' ]
        }
    };

    // Init builder and add assets
    plugin.build = new Build(buildOptions);

    plugin.build.addSrc('html', plugin.client.html);
    plugin.build.addSrc('js',   plugin.client.js);
    plugin.build.addSrc('css',  plugin.client.css);
    plugin.build.addSrc('less', plugin.client.less);
    plugin.build.addModule(plugin.client.modules);


    // REGISTER security assets (since security cannot depend on backend b/c circular dependencies)
    plugin.build.addSrc('js', security.client.js);
    plugin.build.addSrc('html', security.client.html);
    plugin.build.addModule(security.client.modules);

    // Run build after all modules have been registrated
    event.on('modules.loaded', function () {
        plugin.build.initGulp();
        if (env === 'development') {
            plugin.build.run(['development']);
        } else {
            plugin.build.run(['production']);
        }
    });

    // CONFIG APP
    app.use(express.cookieParser());
    app.use(express.bodyParser());
    app.use(express.json());
    app.use(express.urlencoded());
    // make secret configurable
    app.use(express.session({
        store: new session({ mongoose_connection: mongoose.connection }),
        secret: security.sessionSecret, 
        path: '/backend',
        maxAge: 100 * 60 * 60 * 24
    }));
    app.use(flash());
    app.use(security.passport.initialize());
    app.use(security.passport.session());
    app.use(security.middleware.loadRoles);
    app.use(app.router);

    // Register routes from routes.js
    registerRoutes(app, security);

    // add client as static folder
    app.use(express.static(__dirname + '/build/client'));

    var passportStrategyConf = { 
        successRedirect: route + '/',
        failureRedirect: route + '/login',
        failureFlash: true 
    };
    app.post('/login', security.passport.authenticate('local', passportStrategyConf) );


    // REGISTER APP
    server.use(route, app);

    // SECURITY
    // Configure backend permissions
    security.permissions.backend = ['login'];

    register(null, {
        backend: plugin,
    });
};