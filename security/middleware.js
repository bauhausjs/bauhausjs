var model = require('./model');

var middleware = module.exports = {};

middleware.loadRoles = function (req, res, next) {
    // User roles and permissions are added as soon user is authorized by passport
    // Info is persisted for the hole session, user must login again to receive new roles and permissions
    if (req.user && !req.session.user) {
        model.role.model.find({'_id': { $in: req.user.roles }}, function (err, docs) {
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

/**
 * Middleware which checks if user is authorized
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
};