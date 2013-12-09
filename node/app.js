var middleware = require('./middleware'),
    node = require('./model');

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
                    { name: 'Content' },
                    { name: 'Sidebar' }
                ]
            }
        }
    };
    module.models[ node.config.name.toLowerCase() ] = node;


    node.api.get('/', function (req, res) {
        res.send("Here is the API");
    })
    // register REST api at backend
    backend.use('/api', node.api);

    var renderStack = [
        middleware.loadNode,
        middleware.generateLoadNodeTypes(module.types),
        content.middleware.loadContent,
        content.middleware.renderContent(content.types),
        middleware.renderSlots,
        middleware.renderNode,
        middleware.errorHandler
    ];
    // register render stack
    frontend.get('*', renderStack);

    register(null, {
        node: module
    });
};