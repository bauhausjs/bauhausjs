var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var fileSchema = new Schema({
    name: String,
    type: Number,
    data: Buffer,
    content: Array,
    lastmod: Number,
    metadata: Object,
    transforms: Object,
    parent: String,
    parentId: Schema.Types.ObjectId
});

module.exports = mongoose.model('File', fileSchema);