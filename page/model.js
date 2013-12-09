var mongoose = require('mongoose'),
    materializedPlugin = require('mongoose-materialized'),
    baucis = require('baucis');

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

/** Model of Page */
page.model = mongoose.model(page.config.name, page.schema);


baucis.rest({
    singular:'Page', 
    select:'_type name route title label parentId', swagger: true
});


page.api = baucis();

