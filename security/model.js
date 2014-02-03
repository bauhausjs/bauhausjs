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
    permissions: Schema.Types.Mixed
});

role.model = mongoose.model('Role', role.schema);
baucis.rest({
    singular:'Role', 
    select:'name permissions', swagger: true
});


/* User */
user.schema = new Schema({
    roles: [Schema.Types.ObjectId],
    public: {
        firstname: String,
        lastname: String
    }
}, { collection: 'bauhaus-users'} );
user.schema.plugin(passportLocalMongoose);
user.model = mongoose.model('User', user.schema);

var controller = baucis.rest({
    singular:'User', 
    select:'username roles public', swagger: true
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

user.api.get('/CurrentUser', function (req, res, next) {
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
