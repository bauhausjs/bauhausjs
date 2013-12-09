var content = require('./model').model,
    debug = require('debug')('bauhaus:content')
    ejs = require('ejs'),
    View = require('express/lib/view');

var middleware = module.exports = {};

/**
 * Generates middleware which adds content types to request
 * @param  {Array}   contentTypes List of content types from service content.types
 * @return {Function}             Middleware function
 */
middleware.generateLoadContentTypes = function generateLoadContentTypes (contentTypes) {
    var loadContentTypes = function loadContentTypes (req, res, next) {
        if (!req.bauhaus) return next();
        if (!req.bauhaus.content) return next();

        req.bauhaus.content.types = contentTypes;
        next();
    };
    return loadContentTypes;
};

/**
 * Middleware which loads contents for loaded page to req.bauhaus.content.data
 * @param  {[type]}   req  [description]
 * @param  {[type]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
middleware.loadContent = function loadContent (req, res, next) {
    if (!req.bauhaus || !req.bauhaus.node || !req.bauhaus.node.current) return next();

    content.find({'_node': req.bauhaus.node.current._id}, 'content meta _type', function (err, contents) {
        if (err || contents.length === 0) return next();
        debug("Loaded " + contents.length + " content blocks");
        req.bauhaus.content = {
            data: contents
        };
        next();
    });
};

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
                    if (err) html = null;
                    req.bauhaus.content.rendered.push(html);
                });
            }
        });

        next();
    };
};