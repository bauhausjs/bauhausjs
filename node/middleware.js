var nodes = require('./model').model,
    debug = require('debug')('bauhaus:node');

var middleware = module.exports = {};

middleware.loadNode = function loadNode (req, res, next) {
    if (!req.bauhaus) req.bauhaus = {};

    var route = req.url;
    nodes.findOne({ 'route': route  }, "title label _type _model", function (err, node) {
        if (err || node === null) return next(new Error("PageNotFound"));
        req.bauhaus.node = {
            current: node
        };
        debug('Loaded "' +  node.title + '" (' + node._id + ') for route ' + route);
        next();
    });
};

middleware.generateLoadNodeTypes = function generateLoadNodeTypes (nodeTypes) {
    return function loadNodeTypes (req, res, next) {
        if (!req.bauhaus) return next();
        if (!req.bauhaus.node) req.bauhaus.node = {};

        var type = req.bauhaus.node.current._type;
        req.bauhaus.node.type = nodeTypes[type];
        next();
    };
};

middleware.renderSlots = function renderSlots (req, res, next) {
    if (!req.bauhaus.node.type.slots) return next();

    req.bauhaus.slots = [];

    req.bauhaus.content.data.forEach(function (content, index) {
        var slot = content.meta.slot ? content.meta.slot : 0;
        if (req.bauhaus.slots[ slot ] === undefined) req.bauhaus.slots[slot] = "";
        req.bauhaus.slots[ slot ] += req.bauhaus.content.rendered[index];
    });
    next();
};

middleware.renderNode = function renderNode (req, res, next) {
    var template = req.bauhaus.node.type.template;
    var data = req.bauhaus;
    console.log("Request")
    console.log(req.bauhaus);
    res.render(template, data);
};

middleware.errorHandler = function (err, req, res, next) {
    next();
};