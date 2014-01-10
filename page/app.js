var middleware = require('./middleware'),
    page = require('./model'),
    api = require('./api');

module.exports = function setup(options, imports, register) {
    var frontend = imports.frontend.app,
        backend = imports.backend.app,
        content = imports.content;

    var module = { 
        models: {},
        middleware: middleware,
        types: {
            '2-col-page': {
                title: "2-column Page",
                model: 'Page',
                template: __dirname + '/page.ejs',
                slots: [
                    { name: 'content', label: 'Content' },
                    { name: 'left', label: 'Sidebar' }
                ]
            }
        }
    };
    module.models[ page.config.name.toLowerCase() ] = page;

    // Allow origin access for testing
    if (process.env.NODE_ENV == 'development')
    var allowCrossDomain = function(req, res, next) {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
        res.header('Access-Control-Allow-Headers', 'Content-Type');

        next();
    }
    backend.use(allowCrossDomain);

    api.get('/PageTypes', function (req, res) {
        res.json(module.types);
    });

    // register REST api at backend
    backend.use('/api', api);

    var renderStack = [
        middleware.loadPage,
        middleware.loadPageType(module.types),
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