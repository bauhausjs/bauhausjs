var debug = require('debug')('bauhaus:content')
    ejs = require('ejs'),
    async = require('async'),
    View = require('express/lib/view');

module.exports = function (mongoose) {
    var populateDocument = require('./helper').populateDocument(mongoose);

    var middleware = {};

    /**
     * Generates middleware which adds content types to request
     * @param  {Array}   contentTypes List of content types from service content.types
     * @return {Function}             Middleware function
     */
    middleware.loadContentTypes = function (contentTypes) {
        var loadContentTypes = function loadContentTypes (req, res, next) {
            if (!req.bauhaus || !req.bauhaus.content) return next();

            req.bauhaus.content.types = contentTypes;
            debug('Loaded Content Types', Object.keys(contentTypes));
            next();
        };
        return loadContentTypes;
    };

    /**
     * Middleware which loads contents for loaded page to req.bauhaus.content.data
     */
    middleware.loadContent = function loadContent (req, res, next) {
        if (!req.bauhaus || !req.bauhaus.page) return next();

        mongoose.models.Content.find({'_page': req.bauhaus.page._id}, 'content meta _type', function (err, contents) {
            if (err || contents.length === 0) return next();

            debug("Loaded " + contents.length + " content blocks");

            var populateParallel = [];
            for (var c in contents) {
                // Add callback in Closure
                (function (content) {
                    populateParallel.push(function (callback) {
                        content.populateFields('content', callback);
                    });
                })(contents[c]);
            }
            // Perform parallel population on all documents (documents are checked for references,
            // if there are any, there are populated)
            async.parallel(populateParallel, function (err, result) {
                if (err) return next();

                req.bauhaus.content = {
                    data: result
                };
                next();
            });
        });
    };

    /**
     * Returns middleware function, which renders content from Array.<Object> 
     * req.bauhaus.content.data according to the passed content types to 
     * Array.<String> req.bauhaus.content.rendered.
     * 
     * @param  {Array} contentTypes Pass service content.types
     * @return {Function}           Middleware
     */
    middleware.renderContent = function (contentTypes) {
        return function renderContent (req, res, next) {
            if (!req.bauhaus || !req.bauhaus.content) return next();

            req.bauhaus.content.rendered = [];
            req.bauhaus.content.data.forEach(function (item, index) {
                // check if content type exists
                var typeName = item._type;
                if (typeName in contentTypes) {
                    var contentType = contentTypes[ typeName ];

                    res.render(contentType.template, item.content, function (err, html) {
                        if (err) html = "";
                        req.bauhaus.content.rendered.push(html);
                    });
                }
            });

            debug("Rendered " + req.bauhaus.content.rendered.length + " content elements");

            next();
        };
    };

    return middleware;
}