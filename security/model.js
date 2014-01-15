var mongoose = require('mongoose'),
    passportLocalMongoose = require('passport-local-mongoose'),
    baucis = require('baucis');

var user = module.exports = {};

var Schema = mongoose.Schema;

user.schema = new Schema({});

user.schema.plugin(passportLocalMongoose);

user.model = mongoose.model('User', user.schema);

var controller = baucis.rest({
    singular:'User', 
    select:'username password', swagger: true
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