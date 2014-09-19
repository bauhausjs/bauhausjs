var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var fileSchema = new Schema({
    name: String,
    type: Number,
    data: Buffer,
    content: Array,
    metadata: Object,
    transform: Object,
    parent: Schema.Types.ObjectId,
    parentId: Schema.Types.ObjectId
});

module.exports = mongoose.model('File', fileSchema);