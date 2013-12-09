var mongoose = require('mongoose'),
    baucis = require('baucis');

/** @module content/model */
var content = module.exports = {};

/* Configuration */
content.config = {
    name: 'Content',
    collection: 'contents'
};

var Schema = mongoose.Schema;

/** Schema of Content */
content.schema = new Schema({
  _page : { type: Schema.ObjectId, ref: 'Page' },
  _type: String,
  content: {},
  meta: {
    position: Number,
    slot: Number
  }
}, { collection : 'content', discriminatorKey : '_model' });


/** Model of Content */
content.model = mongoose.model(content.config.name, content.schema);


baucis.rest({
    singular:'Content', 
    select:'_type content meta _page', swagger: true
});


content.api = baucis();

