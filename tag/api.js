var baucis = require('baucis')
    Tag = require('./model/tag'),
    mongoose = require('mongoose');

module.exports = function (bauhausConfig) {

    var tagController = baucis.rest(mongoose.model('Tag'));

    return tagController;   
};
