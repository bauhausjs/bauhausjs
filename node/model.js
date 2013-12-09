var mongoose = require('mongoose'),
    materializedPlugin = require('mongoose-materialized'),
    baucis = require('baucis');

/** @module node/model */
var node = module.exports = {};

/* Configuration */
node.config = {
    name: 'Node',
    collection: 'nodes'
};

var Schema = mongoose.Schema;

/** Schema of Node */
node.schema = new Schema({
  name : String,
  route: { type: String, index: true, unique: true },
  title: String,
  label: String,
  _type: String,
}, { 
    collection : node.config.collection, 
    discriminatorKey : '_model' 
});

// Add plugin which provides automatic support for mongodb`s materialized path
node.schema.plugin(materializedPlugin);

/** Model of Node */
node.model = mongoose.model(node.config.name, node.schema);


baucis.rest({
    singular:'Node', 
    select:'_type name route title label parentId', swagger: true
});


node.api = baucis();

