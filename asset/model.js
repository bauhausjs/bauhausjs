
module.exports = function (mongoose) {
    var asset = {};
    /* Configuration */

    asset.config = {
        name: 'Asset',
        collection: 'assets'
    };

    var Schema = mongoose.Schema;

    /** Schema of Asset */
    asset.schema = new Schema({
        name: String,
        data: Buffer,
        metadata: Object
    });


    asset.model = mongoose.model(asset.config.name, asset.schema);

    return asset;
};