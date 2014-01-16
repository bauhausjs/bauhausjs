var mongoose = require('mongoose'),
    passportLocalMongoose = require('passport-local-mongoose'),
    baucis = require('baucis');

var Schema = mongoose.Schema;
var model = module.exports = {
    user: {},
    role: {},
    permission: {}
};

var user = model.user,
    role = model.role,
    permission = model.permission;

/* Role */
role.schema = new Schema({
    name: String,
    label: String
});

role.model = mongoose.model('Role', role.schema);
baucis.rest({
    singular:'Role', 
    select:'name label', swagger: true
});

/* Permissions */
permission.schema = new Schema({
    subject: String,
    name: String,
    label: String
});

role.model = mongoose.model('Role', role.schema);
baucis.rest({
    singular:'Role', 
    select:'name label', swagger: true
});

/* User */
user.schema = new Schema({
    roles: [Schema.Types.ObjectId]
});
user.schema.plugin(passportLocalMongoose);
user.model = mongoose.model('User', user.schema);

var controller = baucis.rest({
    singular:'User', 
    select:'username roles', swagger: true
});

/* Middleware which is add for put method (=update user) to store password after user was stored */
controller.documents('put', function (req, res, next) {
    if (req.body && req.body.password && req.body.password.length > 0) {
        user.model.findOne({_id: req.params.id }, function (err, user) {
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


user.api = baucis();
