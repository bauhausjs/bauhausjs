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
            js: [__dirname + '/client/javascript/**/*.js'],
            html: [__dirname + '/client/javascript/**/*.html']
        }
    };

    var page = registerModel(mongoose);
    page.api = registerApi(mongoose, page, api, plugin);

    plugin.models[ page.config.name.toLowerCase() ] = page;

    middleware = registerMiddleware(page);
    plugin.middleware = middleware;
    // register REST api at backend
    api.use(page.api);

    var renderStack = [
        middleware.loadPage,
        middleware.loadPageType(plugin.types),
        middleware.loadNavigation,
        content.middleware.loadContent,
        content.middleware.renderContent(content.types),
        middleware.renderSlots,
        middleware.renderPage,
        middleware.errorHandler
    ];

    // REGISTER client assets
    backend.build.addSrc('js', plugin.client.js);
    backend.build.addSrc('html', plugin.client.html);

    // register render stack
    frontend.get('*', renderStack);

    register(null, {
        page: plugin
    });
};