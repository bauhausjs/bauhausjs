var mongoose = require('mongoose'),
    materializedPlugin = require('mongoose-materialized'),
    Role = require('../../security/model/role');

var Schema = mongoose.Schema;

var pageSchema = new Schema({
    title: String,
    label: String,
    _type: String,
    route: String,
    public: Boolean,
    isSecure: Boolean,
    roles: [{ type: Schema.Types.ObjectId, ref: 'Role' }]
}, {
    discriminatorKey : '_model'
});

pageSchema.index({ route: 1, public: 1 });

var routePlugin = function (schema, options) {

    // method to check path uniqueness of document
    var routeIsUnique = function (page, callback) {
        if (page.public === true) {
            mongoose.model('Page').findOne({ route: page.route, public: true }, function (err, doc) {
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
pageSchema.plugin(materializedPlugin);
pageSchema.plugin(routePlugin);

// overwrite types defined by mongoose-materialized plugin, since its schema format dont work with baucis swagger
pageSchema.path('parentId', Schema.Types.ObjectId);
pageSchema.path('path', String);
pageSchema.path('_w', String);


var page = module.exports = mongoose.model('Page', pageSchema);
