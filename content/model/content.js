var mongoose = require('mongoose');

var Schema = mongoose.Schema;

/** Schema of Content */
var contentSchema = new Schema({
    _page : { type: Schema.ObjectId, ref: 'Page' },
    _type: String,
    content: {},
    meta: {
        position: Number,
        slot: Number
    }
}, { collection: 'content', discriminatorKey : '_model' });

var content = module.exports = mongoose.model('Content', contentSchema);


