# Bauhaus mongoose

This plugin provides an [mongoose](http://mongoosejs.com/) instance, which is shared between all plugins. Although mongoose uses a global variable to share models, they are not shared if multiple npm installs of mongoose are used. Because of that always add your model to this mongoose instance.

## API

mongoose.mongoose

Type: `Object` Mongoose instance

mongoose.mongoose.models

Type: `Object` Map with all models, which were registrated for mongoose. Use this to query database, e.g. `mongoose.models.Page.findOne()`.