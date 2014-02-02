var express = require('express'),
    build = require('./build'),
    flash = require('connect-flash'),
    session = require('connect-mongo')(express),
    path = require('path');;

module.exports = function setup(options, imports, register) {
    var app = express();
    var server = imports.server.app,
        security = imports.security,
        mongoose = imports.mongoose;


    var route = typeof options.route === 'string' ? options.route : '/backend';
    var env = app.get('env');

    var buildConfig = {
        env: env,
        html: {
            src: [
                __dirname + '/public/javascript/**/*.html',
            ],
            dest: __dirname +  '/build/javascript'
        },
        js: {
            src: [__dirname + '/public/javascript/**/*.js'],
            dest: __dirname +  '/build/javascript'
        },
        css: {
            src: [__dirname + '/public/css/styles.css'],
            concat: 'all.css',
            dest: __dirname +  '/build/css'
        },
        less: {
            src: [__dirname + '/client/css/all.less'],
            paths: [ __dirname + '/client/css' ]
        }
    };

    var gulp = build(buildConfig);

    if (env === 'development') {
        gulp.start.apply(gulp, ['development']);
    } else {
        gulp.start.apply(gulp, ['production']);
    }

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


    app.use(express.static(__dirname + '/build'));

    // remove by including compiled from build/ later
    app.use(express.static(__dirname + '/client'));

    // Configure backend permissions
    security.permissions.backend = ['login'];

    var isAuthenticated = function (req, res, next) {
        if (req.user) return next();
        if (req.get('Content-Type') === 'application/json') {
            res.status('403');
            res.write('Not authorized');
            res.end();
        } else {
            res.redirect('/backend/login');
        }
    }

    app.get('/', isAuthenticated, function (req, res) {
        res.render(__dirname + '/templates/index.ejs', { env: process.env.NODE_ENV, username: req.user.username });
    });

    // POST Login endpoint
    var passportStrategyConf = { successRedirect: '/backend/',
                                failureRedirect: '/backend/login',
                                failureFlash: true };
    app.post('/login', security.passport.authenticate('local', passportStrategyConf) );

    // Login Form
    app.get('/login', function (req, res) {
        if (req.user) return res.redirect('/backend/');

        res.render(__dirname + '/templates/login.ejs', { error: req.flash('error'), info: req.flash('info') });
    });

    // Logout request
    app.get('/logout', function (req, res) {
        flash('info','Logged out');
        req.logout();
        res.redirect('/backend/login');
    });

    security.models.user.api.get('/CurrentUser', function (req, res, next) {
        if (req.user) {
            var user = {
                _id: req.user._id,
                username: req.user.username,
                roles: req.bauhaus.roles,
                permissions: req.bauhaus.permissions

            };
            res.json(user);
        } else {
           res.status(403);
           res.write('Not authorized');
           res.end();
        }
    });

    // register user API
    app.use('/api', isAuthenticated);
    app.use('/api', security.models.user.api); // add user AND roles
    app.use('/api', security.models.permission.api);

    // Add backend app to server
    server.use(route, app);

    register(null, {
        backend: { app: app },
    });
};