var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var filerightSchema = new Schema({
    path: String,
    user: String
});

module.exports = mongoose.model('FileRight', filerightSchema);