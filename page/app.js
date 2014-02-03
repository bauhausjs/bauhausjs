var registerMiddleware = require('./middleware'),
    registerModel = require('./model'),
    registerApi = require('./api');

module.exports = function setup(options, imports, register) {
    var frontend = imports.frontend.app,
        backend = imports.backend.app,
        content = imports.content,
        security = imports.security,
        mongoose = imports.mongoose.mongoose,
        api = imports.api.app;

    security.permissions.page = ['use', 'content'];

    var module = { 
        models: {},
        middleware: {},
        types: {}
    };

    var page = registerModel(mongoose);
    page.api = registerApi(mongoose, page, api);

    module.models[ page.config.name.toLowerCase() ] = page;

    module.middleware = registerMiddleware(page);

    // register REST api at backend
    api.use(page.api);

    var renderStack = [
        middleware.loadPage,
        middleware.loadPageType(module.types),
        middleware.loadNavigation,
        content.middleware.loadContent,
        content.middleware.renderContent(content.types),
        middleware.renderSlots,
        middleware.renderPage,
        middleware.errorHandler
    ];
    // register render stack
    frontend.get('*', renderStack);

    register(null, {
        page: module
    });
};