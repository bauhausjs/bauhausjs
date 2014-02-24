var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var roleSchema = new Schema({
    name: String,
    permissions: Schema.Types.Mixed
});

var role = module.exports = mongoose.model('Role', roleSchema); 

