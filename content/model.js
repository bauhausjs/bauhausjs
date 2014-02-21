
module.exports = function (mongoose) {
    /** @module content/model */
    var content = {};

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

    /**
     * Populates all fields for the given path of a document
     *
     * Expects relations as subfield of given path defined as following
     * {
     *     "type": "relation",
     *     "model": "MONGOOSE MODEL NAME",
     *     "documents": [ OBJECT_ID, OBJECT_ID ] // OR "document": OBJECT_ID
     * }
     * 
     * @param  {String}   rootPath Model path, which subfields should be checked, only one level allowed, default: "" 
     * @param  {Function} callback Callback with format function(err, result) which returns populated object
     */
    content.schema.methods.populateFields = function populateFields (rootPath, callback) {
        document = this;

        // Object which is used to check all fields for relations
        var fieldsToCheck = rootPath ? document[rootPath] : document.toObject();
        // Root path is used to create population query
        rootPath = rootPath ? rootPath + "." : "";

        // Mongoose populate query options
        var populate = [];
        // Iterate over all fields and check if they contain a reference
        for (var f in fieldsToCheck) {
            if (fieldsToCheck.hasOwnProperty(f)) {
                var field = fieldsToCheck[f];

                if (field && field.type && field.type === 'reference' && field.model) {
                    // Add population query to options, depending on actual path (can end with both document or document)
                    if (field.document) {
                        populate.push({ path: rootPath + f  + '.document', model: field.model })
                    } else if (field.documents) {
                        populate.push({ path: rootPath + f  + '.documents', model: field.model })
                    }
                }
            }
        }

        if (populate.length > 0) {
            // If there are references, perform population query to populate fields
            this.model('Content').populate(document, populate, function (err, doc) {
                callback(err, doc);
            })
        } else {
            // Return untouched document if there are no fields to populate
            callback(null, document);
        }
    };


    /** Model of Content */
    content.model = mongoose.model(content.config.name, content.schema);

    return content;
}

