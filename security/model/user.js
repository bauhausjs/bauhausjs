var mongoose = require('mongoose');
var passportLocalMongoose = require('passport-local-mongoose');
var sha1 = require('sha1');

var Schema = mongoose.Schema;

var userSchema = new Schema({
    email: String,
    resetPasswordToken: String,
    roles: [Schema.Types.ObjectId],
    fields: {}
}, {collection: 'bauhaus-users'});


userSchema.methods.setResetPasswordToken = function () {
    var time = Date.now().toString();
    var token = sha1( time + this.email + this.username );
    this.resetPasswordToken = token;
};

userSchema.plugin(passportLocalMongoose);

var user = module.exports = mongoose.model('User', userSchema); 