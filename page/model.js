var mongoose = require('mongoose'),
    materializedPlugin = require('mongoose-materialized');

/** @module page/model */
var page = module.exports = {};

/* Configuration */
page.config = {
    name: 'Page',
    collection: 'pages'
};

var Schema = mongoose.Schema;

/** Schema of Page */
page.schema = new Schema({
  name : String,
  route: { type: String, index: true, unique: true },
  title: String,
  label: String,
  _type: String,
}, { 
    collection : page.config.collection, 
    discriminatorKey : '_model' 
});


// Add plugin which provides automatic support for mongodb`s materialized path
page.schema.plugin(materializedPlugin);

// overwrite types defined by mongoose-materialized plugin, since its schema format dont work with baucis swagger
page.schema.path('parentId', Schema.Types.ObjectId);
page.schema.path('path', String);
page.schema.path('_w', String);

/** Model of Page */
page.model = mongoose.model(page.config.name, page.schema);


