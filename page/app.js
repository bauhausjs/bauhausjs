var middleware = require('./middleware'),
    page = require('./model');

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
                    { name: 'content', title: 'Content' },
                    { name: 'left', title: 'Sidebar' }
                ]
            }
        }
    };
    module.models[ page.config.name.toLowerCase() ] = page;


    page.api.get('/', function (req, res) {
        res.send("Here is the API");
    })
    // register REST api at backend
    backend.use('/api', page.api);

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