var model = require('./model');

var middleware = module.exports = {};

middleware.loadRoles = function (req, res, next) {
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
        // remove user info from session
        req.session.user = null;
        next();
    }
};