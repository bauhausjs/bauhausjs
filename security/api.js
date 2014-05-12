var baucis = require('baucis'),
    Role = require('./model/role'),
    User = require('./model/user');

module.exports = function (bauhausConfig) {

    var roleController = baucis.rest({
        singular:'Role', 
        select:'name permissions', swagger: true
    });

    var userController = baucis.rest({
        singular:'User', 
        select:'username roles fields', swagger: true
    });

    /* Middleware which is add for put method (=update user) to store password after user was stored */
    userController.query('put', function (req, res, next) {
        if (req.body && req.body.password && req.body.password.length > 0) {
            User.findOne({_id: req.params.id }, function (err, user) {
                if (user._id) {
                    user.setPassword(req.body.password, function () {
                        user.save(function () {
                            next();
                        });
                    });
                } else {
                    next();
                }
            });
        } else {
            next();
        }
    });


    api = baucis();

    api.get('/CurrentUser', function (req, res, next) {
        if (req.session.user) {
            var user = {
                _id: req.session.user._id,
                username: req.session.user.username,
                roles: req.session.user.roles,
                permissions: req.session.user.permissions

            };
            res.json(user);
        } else {
           res.status(403);
           res.write('Not authorized');
           res.end();
        }
    }); 

    api.get('/CustomUserFields', function (req, res, next) {
        res.json(bauhausConfig.customUserFields);
    });

    api.get('/Permissions', function (req, res, next) {
        res.json(bauhausConfig.security.permissions)
    });

    return api;
};