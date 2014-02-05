var registerMiddleware = require('./middleware'),
    registerModel = require('./model'),
    registerApi = require('./api');

module.exports = function setup(options, imports, register) {
    var api = imports.api.app,
        mongoose = imports.mongoose.mongoose;

    var plugin = { 
        models: {},
        middleware: {},
        types: {},
        api: null,
        addType: function (name, config) {
            this.types[name] = config;
        }
    };

    var content = registerModel(mongoose);
    plugin.api = registerApi(mongoose, plugin);    
    plugin.models[ content.config.name.toLowerCase() ] = content;

    plugin.middleware = registerMiddleware(mongoose);

    // register REST api at backend
    api.use(plugin.api);

    register(null, {
        content: plugin
    });
};