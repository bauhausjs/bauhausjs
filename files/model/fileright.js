var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var filerightSchema = new Schema({
    path: String,
    visible: Boolean
});

module.exports = mongoose.model('FileRight', filerightSchema);