var registerMiddleware = require('./middleware'),
    registerModel = require('./model'),
    registerApi = require('./api');

module.exports = function setup(options, imports, register) {
    var api = imports.api.app,
        mongoose = imports.mongoose.mongoose;

    var module = { 
        models: {},
        middleware: {},
        types: {}
    };

    var content = registerModel(mongoose);
    content.api = registerApi(mongoose, content, module.types);    
    module.models[ content.config.name.toLowerCase() ] = content;

    module.middleware = registerMiddleware(content.model);

    // register REST api at backend
    api.use(content.api);

    register(null, {
        content: module
    });
};