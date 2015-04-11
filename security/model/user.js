var mongoose = require('mongoose');
var passportLocalMongoose = require('passport-local-mongoose');
var sha1 = require('sha1');

var Schema = mongoose.Schema;

var userSchema = new Schema({
    email: String,
    resetPasswordToken: String,
    confirmMailToken: String,
    emailConfirmed: Boolean,
    roles: [Schema.Types.ObjectId],
    fields: {}
}, {collection: 'users'});


userSchema.methods.setResetPasswordToken = function () {
    var time = Date.now().toString();
    var token = sha1( time + this.email + this.username );
    this.resetPasswordToken = token;
};

userSchema.methods.setConfirmMailToken = function () {
    var time = Date.now().toString();
    var token = sha1( time + this.email + this.username );
    this.confirmMailToken = token;
};

userSchema.methods.toJSON = function() {
    var user = this.toObject();
    delete user.salt;
    delete user.hash;
    return user;
};

var passportLocalMongooseOptions = {
    usernameLowerCase: true
};

userSchema.plugin(passportLocalMongoose, passportLocalMongooseOptions);

var user = module.exports = mongoose.model('User', userSchema); 
user.schema = userSchema;