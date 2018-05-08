var mongoose = require('mongoose');
var passportLocalMongoose = require('passport-local-mongoose');
var sha1 = require('sha1');

var Schema = mongoose.Schema;

var userSchema = new Schema({
    username: String,
    emailConfirmed: Boolean,
    roles: [Schema.Types.ObjectId],
    fields: {},
    login:  {
        attempts: {type: Number, default: 0}, 
        last: {type: Date, default: Date.now}
    },
    created: { type: Date, default: Date.now },
    resetPasswordToken: String,
    confirmMailToken: String,
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
    delete user.login;
    delete user.reset;
    return user;
};
var passportLocalMongooseOptions = {
    usernameLowerCase: true,
    hashField: "login.hash",
    saltField: "login.salt",
    attemptsField: "login.attempts",
    lastLoginField: "login.last",
    limitAttempts: true,
    interval: 10,
    digestAlgorithm: "sha1"
};

userSchema.plugin(passportLocalMongoose, passportLocalMongooseOptions);

var user = module.exports = mongoose.model('User', userSchema); 
user.schema = userSchema;