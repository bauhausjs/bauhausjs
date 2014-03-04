var baucis = require('baucis'),
    async = require('async'),
    Content = require('./model/content')
    populateConfig = require('../document/helper').populateConfig;

module.exports = function (bauhausConfig) {
    var controller = baucis.rest({
        singular:'Content', 
        select:'_type content meta _page', swagger: true
    });

    // Populates fields for both single or collection queries
    controller.documents('get', function populateReferences (req, res, next) {
        if (Array.isArray(req.baucis.documents) && req.baucis.documents.length > 0) {
            // If result contains array result, perform population on all documents
            var populateParallel = [];
            for (var d in req.baucis.documents) {

                var contentType = bauhausConfig.contentTypes[ req.baucis.documents[d]._type ];
                var populationConfig = populateConfig(contentType, 'content.');

                // Add callback in Closure
                (function (doc, config) {
                    populateParallel.push(function (callback) {
                        if (config.length > 0) {
                            doc.populate(config, callback);
                        } else {
                            callback(null, doc);
                        }
                    });
                })(req.baucis.documents[d], populationConfig);
            }
            // Perform parallel population on all documents (documents are checked for references,
            // if there are any, there are populated)
            async.parallel(populateParallel, function (err, result) {
                if (err) return next(err);

                req.baucis.documents = result;
                next();
            });
        } else if (typeof req.baucis.documents === 'object' && req.baucis.documents._type) {
            var contentType = bauhausConfig.contentTypes[ req.baucis.documents._type ];
            var populationConfig = populateConfig(contentType, 'content.');
            if (populationConfig.length > 0) {
                // If result contains object, populate it 
                req.baucis.documents.populate(populationConfig, function (err, result) {
                    next(err);
                });
            } else {
                // Return document directly if there is nothing to populate
                next();
            }
        } else {
            return next();
        }
    });

    var api = baucis();

    api.get('/ContentTypes', function (req, res, next) {
        res.json(bauhausConfig.contentTypes);
    });

    return api;
}