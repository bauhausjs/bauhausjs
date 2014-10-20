var baucis = require('baucis')
    Tag = require('./model/tag');

module.exports = function (bauhausConfig) {

    var tagController = baucis.rest({
        singular: 'Tag'
    });

    var app = baucis(); 

    return app;   
};
