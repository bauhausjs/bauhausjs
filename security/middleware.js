var debug = require('debug')('bauhaus:security'),
    Role = require('./model/role');

var middleware = module.exports = {};

middleware.loadUser = function loadUser (req, res, next) {
    // User roles and permissions are added as soon user is authorized by passport
    // Info is persisted for the hole session, user must login again to receive new roles and permissions
    if (req.user && !req.session.user) {
        Role.find({'_id': { $in: req.user.roles }}, function (err, docs) {
            if (err) next();

            var roles = [];
            var permissions = [];
            for (var d in docs) {
                var role = docs[d];
                roles.push(role.name);
                if (role.permissions) {
                    for (var permission in role.permissions) {
                        if (permissions.indexOf(permission) !== 0) {
                            permissions.push(permission);
                        }
                    }
                }
            }

            var user = {
                id: req.user._id,
                username: req.user.username,
                roles: roles,
                permissions: permissions
            }
            // add user info to session
            req.session.user = user;

            next();
        })
    } else {
        if (!req.user) {
            // remove user info from session
            req.session.user = null;
        }
        next();
    }

};


middleware.addUserToRender = function addUserToRender (req, res, next) {
    if (req.bauhaus) {

        req.bauhaus.user = req.session.user;
        
        if (req.flash) {
            var flash = req.flash();
            req.bauhaus.authError = flash.error;
        }
    }
    next();
};

/**
 * Generates middleware, which checks if user has the requested permissions.
 *
 *  - If no permission is passed, all users have access. 
 *  - If multiple permissions are passed, user needs all permissions to pass
 * 
 * @param  {String || Array.<String>} permissions Permissions in format ['PLUGIN:PERMISSION'], e.g. ['post:create']
 * @param  {Object} options.redirect Redirect url for unathorized requests, default: '/'
 * @return {Function} Express middleware
 */
middleware.hasPermission = function (permissions, options) {
    // check if permission is array or string, else set to empty array
    permissions = (typeof permissions === 'string' || Array.isArray(permissions)) ? permissions : [];
    // if permission is string, convert to array
    permissions = (typeof permissions === 'string') ? [permissions] : permissions;
    // set redirect option
    options     = (options && typeof options.redirect === 'string') ? options : {redirect: '/'};

    return function hasPermission (req, res, next) {
        var hasPermission = false;

        if (req.session.user && req.session.user.permissions) {
            // check for all configured permissions
            for (var p in permissions) {
                var perm = permissions[p];
                if (req.session.user.permissions.indexOf(perm) != -1) {
                    hasPermission = true;
                } else {
                    // if user has no permission for one requested permission check is canceled 
                    debug('User lacks permission', perm);
                    hasPermission = false;
                    break;
                }
            }
        }

        if (hasPermission === false) {
            // user has no permission
            debug('User lacked required permissions. NO ACCESS');
            if (req.get('Content-Type') === 'application/json') {
                // send error 403 to json requests
                res.status('403');
                res.write('Not authorized');
                res.end();
            } else {
                // redirect other requests
               res.redirect(options.redirect);

            }
        } else {
            // user has permission, let request pass
            debug('User has needed permissions', permissions);
            next();
        }
    }
}

/**
 * Generates middleware which checks if user is authorized
 *  - authorized: next()
 *  - unauthorized and json request: 403
 *  - unauthorized and no json request: 
 * @param  {String}  options.redirect URL were unauthorized users are redirected to
 */
middleware.isAuthenticated = function (options) {
    return function isAuthenticated (req, res, next) {
        if (req.user) return next();
        if (req.get('Content-Type') === 'application/json') {
            res.status('403');
            res.write('Not authorized');
            res.end();
        } else {
            if (options && options.redirect) {
                res.redirect(options.redirect);
            }
        }
    }  
}
