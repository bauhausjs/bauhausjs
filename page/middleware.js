var debug = require('debug')('bauhaus:page'),
    Page = require('./model/page'),
    contentMiddleware = require('../content/middleware');

var middleware = module.exports = {};

/**
 * Middleware that loads page from database an add it to req.bauhaus.page
 */
middleware.loadPage = function loadPage (req, res, next) {
    if (!req.bauhaus) req.bauhaus = {};

    var route = req.url;

    Page.findOne({ 'route': route  }, "title label _type _model", function (err, page) {
        if (err || page === null) return next(new Error("PageNotFound"));

        req.bauhaus.page = page;
        debug('Loaded "' +  page.title + '" (' + page._id + ') for route ' + route);
        next();
    });
};

/**
 * Returns middleware function which adds page type
 * matching loaded page to req.bauhaus.pageType
 * @param  {Array} pageTypes Array of pageTypes, initialize with service page.types
 * @return {Function}        Middleware
 */
middleware.loadPageType = function (pageTypes) {
    return function loadPageType (req, res, next) {
        if (!req.bauhaus || !req.bauhaus.page) return next();

        var type = req.bauhaus.page._type;
        req.bauhaus.pageType = pageTypes[type];
        debug('Loaded page type "' + type + '"');
        next();
    };
};

middleware.loadNavigation = function (req, res, next) {
    req.bauhaus.navigation = {};
    var query = { parentId: null };

    Page.findOne(query, function (err, doc) {
        doc.getTree({
            condition: { public: true },
            fields: { route: 1, title: 1, label: 1 }
        }, { 
            fields: { route: 1, title: 1, label: 1, path: 1, id: 1, parentId: 1, _w: 1 },
            condition: { public: true }
        }, function (err, tree) {
            for (var parentId in tree) {
                req.bauhaus.navigation.main = tree[ parentId ].children;
            }
            debug('Loaded navigation');
            next();
        });
    });
};

/**
 * Middleware which concats rendered content to slots, according to page type definition
 * and exposes them as object at req.bauhaus.slots with slotname as key and html string as value
 */
middleware.renderSlots = function renderSlots (req, res, next) {
    if (!req.bauhaus.pageType.slots) return next();

    req.bauhaus.slots = {};
    var slotNameMap = [];
    req.bauhaus.pageType.slots.forEach(function (element, index) {
        slotNameMap[index] = element.name; 
    });

    if (!req.bauhaus.content) return next();
    req.bauhaus.content.data.forEach(function (content, index) {
        var slot = content.meta.slot ? content.meta.slot : 0;
        var key = slotNameMap[ slot ];
        if (req.bauhaus.slots[ key ] === undefined) req.bauhaus.slots[ key ] = "";
        req.bauhaus.slots[ key ] += req.bauhaus.content.rendered[index];

        debug('Rendered slot "' + key + '"');
    });
    next();
};

/**
 * Middleware which renders page. It uses the template as defined in req.pageType.template. 
 * The template receives the req.bauhaus object.
 */
middleware.renderPage = function renderPage (req, res, next) {
    var template = req.bauhaus.pageType.template;
    var data = req.bauhaus;
    debug('Render and send page');
    res.render(template, data);
};


/**
 * Middleware error handler which is added to end of render stack and resolves error which occured
 * during rendering (e.g. page not found) and contiues on the express middleware stack without error.
 */
middleware.errorHandler = function errorHandler (err, req, res, next) {
    debug('Error occured', err);
    next();
};

middleware.renderStack = function (pageTypes, contentTypes) {
    return [
        middleware.loadPage,
        middleware.loadPageType(pageTypes),
        middleware.loadNavigation,
        contentMiddleware.loadContent,
        contentMiddleware.renderContent(contentTypes),
        middleware.renderSlots,
        middleware.renderPage,
        middleware.errorHandler
    ];
};
