var baucis = require('baucis'),
    express = require('express');

module.exports = function (mongoose, asset) {
    var assetController = baucis.rest({
        singular: asset.config.name, 
        select:'name',
        connection: mongoose.connection
    });

    var app = express();

    app.use('/' + asset.config.name + 's/info', function (req, res, next) {
        res.json(asset.config);
    });

    app.use(baucis()); 

    return app;   
};

