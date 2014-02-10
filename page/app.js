var registerMiddleware = require('./middleware'),
    registerModel = require('./model'),
    registerApi = require('./api');

module.exports = function setup(options, imports, register) {
    var frontend = imports.frontend.app,
        backend = imports.backend,
        content = imports.content,
        security = imports.security,
        mongoose = imports.mongoose.mongoose,
        api = imports.api.app;

    security.permissions.page = ['use', 'content'];

    var plugin = { 
        models: {},
        middleware: {},
        types: {},
        client: {
            js: [__dirname + '/client/**/*.js'],
            html: [__dirname + '/client/**/*.html'],
            less: [__dirname + '/client/**/*.less'],
            modules: ['bauhaus.page']
        },
        api: null,
        addType: function (name, config) {
            this.types[name] = config;
        }
    };

    var page = registerModel(mongoose);
    plugin.api = registerApi(mongoose, plugin);

    plugin.models[ page.config.name.toLowerCase() ] = page;

    plugin.middleware = registerMiddleware(mongoose);
    // register REST api at backend
    api.use(plugin.api);

    var renderStack = [
        plugin.middleware.loadPage,
        plugin.middleware.loadPageType(plugin.types),
        plugin.middleware.loadNavigation,
        content.middleware.loadContent,
        content.middleware.renderContent(content.types),
        plugin.middleware.renderSlots,
        plugin.middleware.renderPage,
        plugin.middleware.errorHandler
    ];

    // REGISTER client assets
    backend.build.addSrc('js', plugin.client.js);
    backend.build.addSrc('html', plugin.client.html);
    backend.build.addSrc('less', plugin.client.less);
    backend.build.addModule(plugin.client.modules);

    // register render stack
    frontend.get('*', renderStack);

    register(null, {
        page: plugin
    });
};