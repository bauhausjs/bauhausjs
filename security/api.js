var baucis = require('baucis'),
    mongoose = require('mongoose'),
    Role = require('./model/role'),
    User = require('./model/user');

module.exports = function (bauhausConfig) {
    var roleController = baucis.rest(mongoose.model('Role')).select('name permissions');

    var userController = baucis.rest(mongoose.model('User')).select('username roles fields');

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

    userController.get('/currentuser', function (req, res, next) {
        if (req.session.user) {
            var user = {
                id: req.session.user.id,
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

    userController.get('/customuserfields', function (req, res, next) {
        res.json(bauhausConfig.customUserFields);
    });

    userController.get('/currentuser/permissions', function (req, res, next) {
        res.json(bauhausConfig.security.permissions)
    });

    return {
        userController: userController,
        roleController: roleController
    };
};