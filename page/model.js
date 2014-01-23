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
    title: String,
    label: String,
    _type: String,
    route: String,
    public: Boolean
}, { 
    collection : page.config.collection, 
    discriminatorKey : '_model' 
});

page.schema.index({ route: 1, public: 1 });

var routePlugin = function (schema, options) {

    // method to check path uniqueness of document
    var routeIsUnique = function (page, callback) {
        if (page.public === true) {
            mongoose.models['Page'].findOne({ route: page.route, public: true }, function (err, doc) {
                if (doc && doc._id) {
                    if ( doc._id.equals( page._id ) === false ) {
                        page.invalidate('route', 'Route is not unique');
                        callback();
                    } else {
                        callback();
                    }
                } else {
                    callback();
                }
            });
        } else {
            callback();
        }

    }

    schema.pre('validate', function (next, done) {
        routeIsUnique(this, function () {
            next();
        });
    });
};


// Add plugin which provides automatic support for mongodb`s materialized path
page.schema.plugin(materializedPlugin);
page.schema.plugin(routePlugin);

// overwrite types defined by mongoose-materialized plugin, since its schema format dont work with baucis swagger
page.schema.path('parentId', Schema.Types.ObjectId);
page.schema.path('path', String);
page.schema.path('_w', String);

/** Model of Page */
page.model = mongoose.model(page.config.name, page.schema);


