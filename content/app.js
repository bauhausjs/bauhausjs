var middleware = require('./middleware'),
    content = require('./model');

module.exports = function setup(options, imports, register) {
    var backend = imports.backend.app,
        frontend = imports.frontend.app;

    var module = { 
        models: {},
        middleware: middleware,
        types: {
            'article': {
                title: 'Article',
                model: 'Article',
                template: __dirname + '/article.ejs'
            }
        }
    };
    module.models[ content.config.name.toLowerCase() ] = content;

    // register REST api at backend
    backend.use('/api', content.api);

    register(null, {
        content: module
    });
};