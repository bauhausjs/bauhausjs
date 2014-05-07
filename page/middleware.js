var debug = require('debug')('bauhaus:page'),
    Page = require('./model/page'),
    contentMiddleware = require('../content/middleware'),
    securityMiddleware = require('../security/middleware');

var middleware = module.exports = {};

function PageNotFoundError (route) {
    this.value = route;
    this.message = "Page was not found"
}

/**
 * Middleware that loads page from database an add it to req.bauhaus.page
 */
middleware.loadPage = function loadPage (req, res, next) {
    if (!req.bauhaus) req.bauhaus = {};

    var route = req.path;

    Page.findOne({ 'route': route  }, "title label isSecure roles _type _model", function (err, page) {
        if (err || page === null) return next(new PageNotFoundError(route));

        req.bauhaus.page = page;
        debug('Loaded "' +  page.title + '" (' + page._id + ') for route ' + route);
        next();
    });
};

middleware.checkAccess = function (req, res, next) {
    if (!req.bauhaus || !req.bauhaus.page) return next();

    if (req.bauhaus.page.isSecure !== true) {
        // page is not secured, let request pass
        return next();
    } 

    if (!req.session.user) {
        debug("request page is secured, but no user is authorized");
        res.status(401)
        return next("Unauthorized");
    }

    if (req.bauhaus.page.roles && req.bauhaus.page.roles.length > 0) {
        debug("Page accessible only with any of the roles", req.bauhaus.page.roles);

        if (!req.session.user.roleIds || req.session.user.roleIds.length === 0) {
            res.status(403);
            return next("Forbidden");
        }
        var userRoles = req.session.user.roleIds;
        for (var r in req.bauhaus.page.roles) {
            var pageRoleId = req.bauhaus.page.roles[r].toString();
            if (userRoles.indexOf(pageRoleId) !== -1) {
                debug("User has role, let pass", pageRoleId);
                return next();
            }
        }

        debug("User did not match any of the roles, reject");
        res.status(403);
        return next("Forbidden");
    } else {
        // no roles defined and user authorized -> let pass
        return next();
    }
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

    // Method recursively iterates over items and adds `isActive` and
    // `hasActiveChild` fields
    function parseNavItem (item) {
        if (item.route === req.path) {
            item.isActive = true;
        }

        // replace object by array structure
        var childArray = [];
        for (var child in item.children) {
            var subItem = parseNavItem( item.children[ child ] );
            if (subItem.isActive || subItem.hasActiveChildren) {
                item.hasActiveChildren = true;
            }
            childArray.push(subItem);
        }
        // sort by _w
        childArray.sort(function (a, b) { return a._w - b._w });
        item.children = childArray;
        return item;
    }

    Page.findOne(query, function (err, doc) {
        doc.getTree({
            condition: { public: true },
            fields: { route: 1, title: 1, label: 1, _w: 1 }
        }, { 
            fields: { route: 1, title: 1, label: 1, path: 1, id: 1, parentId: 1, _w: 1 },
            condition: { public: true }
        }, function (err, tree) {
            req.bauhaus.navigation.main = [];
            for (var id in tree) {
                if (tree[ id ].parentId === null) {
                    for (var child in tree[ id ].children) {
                        req.bauhaus.navigation.main.push( parseNavItem( tree[ id ].children[ child ] ) );
                    }

                }  
            }
            // sort by _w
            req.bauhaus.navigation.main.sort(function (a, b) { return a._w - b._w });
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

    // Order content by slot and position
    var renderedSlots = {};
    if (!req.bauhaus.content) return next();
    req.bauhaus.content.data.forEach(function (content, index) {
        var slot = content.meta.slot ? content.meta.slot : 0;
        var position = content.meta.position ? content.meta.position : 0;

        if (renderedSlots[ slot ] === undefined) renderedSlots[ slot ] = [];
        renderedSlots[ slot ][ position ] = req.bauhaus.content.rendered[index];
    });

    // Join each slot to single string
    slotNameMap.forEach(function (name, index) {
        req.bauhaus.slots[ name ] = renderedSlots[ index ].join("\n");

        debug('Rendered slot "' + name + '"');
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
        middleware.checkAccess,
        middleware.loadPageType(pageTypes),
        middleware.loadNavigation,
        contentMiddleware.loadContent(contentTypes),
        contentMiddleware.renderContent(contentTypes),
        middleware.renderSlots,
        securityMiddleware.addUserToRender,
        middleware.renderPage,
        middleware.errorHandler
    ];
};
