var debug = require('debug')('bauhaus:content'),
    async = require('async'),
    View = require('express/lib/view'),
    Content = require('./model/content'),
    populateConfig = require('../document/helper').populateConfig;

var middleware = module.exports = {};
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
middleware.loadContent = function (contentTypes) {
    return function loadContent (req, res, next) {
        if (!req.bauhaus || !req.bauhaus.page) return next();

        Content.find({'_page': req.bauhaus.page._id }, 'content meta _type', function (err, contents) {
            if (err || contents.length === 0) return next();

            debug("Loaded " + contents.length + " content blocks");

            var populateParallel = [];
            for (var c in contents) {
                var contentType = contentTypes[ contents[c]._type ];
                var populationConfig = populateConfig(contentType, 'content.');
                // Add callback in Closure
                (function (content, config) {
                    populateParallel.push(function (callback) {
                        content.populate(config, callback);
                    });
                })(contents[c], populationConfig);
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
    }
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

        var renderParallel = [];
        for (var c in req.bauhaus.content.data) {
            var data = req.bauhaus.content.data[c];
            var typeName = data._type;
            if (typeName in contentTypes) {
                var contentType = contentTypes[typeName];
                if (typeof contentType.render === 'function') {
                    (function (data, render) {
                        renderParallel.push(function (callback) {
                            contentType.render(req, res, data, contentType.template, function (err, html) {
                                if (err) debug("Error when calling custom render method of content " + data._id + " of type " + typeName, err);
                                callback(err, html);
                            });
                        });
                    })(data, contentType);
                } else {
                    // Add callback in closure
                    (function (data, template) {
                        renderParallel.push(function (callback) {
                            res.render(template, data, function (err, html) {
                                if (err) debug("Error rendering content", data, err);
                                callback(err, html);
                            });
                        });
                    })(data.content, contentType.template);
                }
            }
        }

        async.parallel(renderParallel, function (err, result) {
            if (err) return next();

            req.bauhaus.content.rendered = result;

            debug("Rendered " + result.length + " content elements");
            next();
        });
    };
};
