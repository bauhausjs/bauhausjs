var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var assetSchema = new Schema({
    name: String,
    data: Buffer,
    metadata: Object,
    transforms: Object,
    parentId: Schema.Types.ObjectId
});

module.exports = mongoose.model('Asset', assetSchema);
