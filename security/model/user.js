var mongoose = require('mongoose'),
    passportLocalMongoose = require('passport-local-mongoose');

var Schema = mongoose.Schema;

var userSchema = new Schema({
    roles: [Schema.Types.ObjectId],
    public: {}
}, {collection: 'bauhaus-users'});

userSchema.plugin(passportLocalMongoose);

var user = module.exports = mongoose.model('User', userSchema); 