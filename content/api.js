var baucis = require('baucis'),
    async = require('async'),
    Content = require('./model/content'),
    mongoose = require('mongoose'),
    populateConfig = require('../document/helper').populateConfig,
    express = require('express');

module.exports = function (bauhausConfig) {
    var controller = baucis.rest(mongoose.model('Content')).select('_type content meta _page');

    // Populates fields for both single or collection queries
    controller.request('get', function populateReferences (req, res, next) {
        req.baucis.outgoing(function (doc, callback) {

            var docType = doc.doc._type;
            var contentType = bauhausConfig.contentTypes[ docType ];
            var populationConfig = populateConfig(contentType, 'content.');
            
            if (populationConfig.length > 0) {
                doc.doc.populate(populationConfig, function(err, result){
                    callback(null, doc);
                });

            } else {
                callback(null, doc);
            }
        });

        next();
    });


    controller.get('/ContentTypes', function (req, res, next) {
        res.json(bauhausConfig.contentTypes);
    });

    return controller;
}