var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var tagSchema = new Schema({
    name: String
});

var tag = module.exports = mongoose.model('Tag', tagSchema); 

