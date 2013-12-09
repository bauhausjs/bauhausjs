var pages = require('./model').model,
    debug = require('debug')('bauhaus:page');

var middleware = module.exports = {};

middleware.loadPage = function loadPage (req, res, next) {
    if (!req.bauhaus) req.bauhaus = {};

    var route = req.url;
    pages.findOne({ 'route': route  }, "title label _type _model", function (err, page) {
        if (err || page === null) return next(new Error("PageNotFound"));
        req.bauhaus.page = {
            current: page
        };
        debug('Loaded "' +  page.title + '" (' + page._id + ') for route ' + route);
        next();
    });
};

middleware.generateLoadPageTypes = function generateLoadPageTypes (pageTypes) {
    return function loadPageTypes (req, res, next) {
        if (!req.bauhaus) return next();
        if (!req.bauhaus.page) req.bauhaus.page = {};

        var type = req.bauhaus.page.current._type;
        req.bauhaus.page.type = pageTypes[type];
        next();
    };
};

middleware.renderSlots = function renderSlots (req, res, next) {
    if (!req.bauhaus.page.type.slots) return next();

    req.bauhaus.slots = [];

    req.bauhaus.content.data.forEach(function (content, index) {
        var slot = content.meta.slot ? content.meta.slot : 0;
        if (req.bauhaus.slots[ slot ] === undefined) req.bauhaus.slots[slot] = "";
        req.bauhaus.slots[ slot ] += req.bauhaus.content.rendered[index];
    });
    next();
};

middleware.renderPage = function renderPage (req, res, next) {
    var template = req.bauhaus.page.type.template;
    var data = req.bauhaus;
    console.log("Request")
    console.log(req.bauhaus);
    res.render(template, data);
};

middleware.errorHandler = function (err, req, res, next) {
    next();
};