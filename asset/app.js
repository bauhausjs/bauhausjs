var model = require('./model'),
    api   = require('./api');

module.exports = function setup(options, imports, register) {
    var mongoose = imports.mongoose.mongoose,
        backend = imports.backend;

    var module = {
        models: {}
    };
  
    var asset = model(mongoose);
    asset.api = api(mongoose, asset);

    // expose to service
    module.models[ asset.config.name.toLowerCase() ] = asset;


    backend.app.use('/api', asset.api);

    register(null, {
        asset: module,
    });
};