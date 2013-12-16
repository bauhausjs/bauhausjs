var mongoose = require('mongoose'),
    passportLocalMongoose = require('passport-local-mongoose'),
    baucis = require('baucis');

var user = module.exports = {};

var Schema = mongoose.Schema;

user.schema = new Schema({});

user.schema.plugin(passportLocalMongoose);

user.model = mongoose.model('User', user.schema);

baucis.rest({
    singular:'User', 
    select:'username password', swagger: true
});


user.api = baucis();