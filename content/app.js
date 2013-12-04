var controllers = require('./controllers'),
    content = require('./model');

module.exports = function setup(options, imports, register) {
    var backend = imports.backend.app,
        node = imports.node;

    var module = { 
        models: {}
    };
    module.models[ content.config.name.toLowerCase() ] = content;

    // register REST api at backend
    backend.use('/api', content.api);

    register(null, {
        content: module
    });
};