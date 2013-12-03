var controllers = require('./controllers'),
    node = require('./model');

module.exports = function setup(options, imports, register) {
    var frontend = imports.frontend.app,
        backend = imports.backend.app;

    var module = { 
        models: {}
    };
    module.models[ node.config.name.toLowerCase() ] = node;


    node.api.get('/', function (req, res) {
        res.send("Here is the API");
    })
    // register REST api at backend
    backend.use('/api', node.api);

    register(null, {
        node: module
    });
};