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
    var backend = {
        app: app,
        build: null
    };

    // BUILD
    // Destination and option config of custom builder
    var buildOptions = {
        env: env,
        html: {
            dest: __dirname +  '/build/javascript'
        },
        js: {
            dest: __dirname +  '/build/javascript'
        },
        css: {
            concat: 'all.css',
            dest: __dirname +  '/build/css'
        },
        less: {
            paths: [ __dirname + '/client/css' ]
        }
    };

    // Init builder and add assets
    backend.build = new Build(buildOptions);
    backend.build.addSrc('html', __dirname + '/public/javascript/**/*.html');
    backend.build.addSrc('js',   __dirname + '/public/javascript/**/*.js');
    backend.build.addSrc('css',  __dirname + '/public/css/styles.css');
    backend.build.addSrc('less', __dirname + '/client/css/all.less');

    // Run build after all modules have been registrated
    event.on('modules.loaded', function () {
        backend.build.initGulp();
        if (env === 'development') {
            backend.build.run(['development']);
        } else {
            backend.build.run(['production']);
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
    app.use(express.static(__dirname + '/build'));
    // remove by including compiled from build/ later
    app.use(express.static(__dirname + '/client'));


    var passportStrategyConf = { successRedirect: route + '/',
                                failureRedirect: route + '/login',
                                failureFlash: true };
    app.post('/login', security.passport.authenticate('local', passportStrategyConf) );


    // REGISTER APP
    server.use(route, app);

    // SECURITY
    // Configure backend permissions
    security.permissions.backend = ['login'];

    register(null, {
        backend: backend,
    });
};