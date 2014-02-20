
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
        metadata: Object,
	transforms: Object,
    	parentId: Schema.Types.ObjectId	    
    });


    asset.model = mongoose.model(asset.config.name, asset.schema);

    return asset;
};
