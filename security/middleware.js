var model = require('./model');

var middleware = module.exports = {};

middleware.loadRoles = function (req, res, next) {
    if (req.user) {
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
            if (!req.bauhaus) req.bauhaus = {};
            req.bauhaus.roles = roles;
            req.bauhaus.permissions = permissions;

            next();
        })
    } else {
        next();
    }
};