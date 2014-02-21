var baucis = require('baucis'), 
    async = require('async');

module.exports = function (mongoose, plugin) {
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
                // Add callback in Closure
                (function (doc) {
                    populateParallel.push(function (callback) {
                        doc.populateFields('content', callback);
                    });
                })(req.baucis.documents[d]);
            }
            // Perform parallel population on all documents (documents are checked for references,
            // if there are any, there are populated)
            async.parallel(populateParallel, function (err, result) {
                if (err) return next(err);

                req.baucis.documents = result;
                next();
            });
        } else if (typeof req.baucis.documents === 'object') {
            // If result contains object, populate it 
            req.baucis.documents.populateFields('content', function (err, result) {
                next(err);
            });
            /*populateDocument('content', function (err, result) {
                if (err) return next(err);

                req.baucis.documents = result;
                next();
            }, req.baucis.documents);*/

        } else {
            return next();
        }
    });

    var api = baucis();

    api.get('/ContentTypes', function (req, res, next) {
        res.json(plugin.types);
    });

    return api;
}