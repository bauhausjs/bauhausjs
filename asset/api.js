/*
 *	TODO: Clean up the code, remove conditions that use coercion such as !property
 *	TODO: Make the returned http statuses and responses consistent.
 */


var fs      = require ('fs'),
	gm      = require ('gm').subClass({ imageMagick: true }),
	baucis  = require('baucis'),
	express = require('express'),
    Asset   = require('./model/asset');

	/*
	 *	Utility functions
	 */

var utilities = { //TODO: Move to an own module
	/*
	 *  Greatest common divisor function
	 */
	gcd: function gcd(nominator, denominator) {
		'use strict';
		return ((nominator > 0) ? gcd(denominator % nominator, nominator) : denominator);
	}
};

module.exports = main;
// mongoose, asset
function main (bauhausConfig) {
	'use strict';
	var assetController = baucis.rest({
		singular: 'Asset',
		select:'name metadata transforms parentId'
	});

    // Register document for CRUD generation
    bauhausConfig.addDocument('Assets', {
        name: 'Asset',
        model: 'Asset',
        collection: 'assets',
        query: {
            conditions: {parentId: null}
        },
        templates: {
            listItem: '<a href="#/document/{{ type }}/{{document._id}}"><img ng-src="/assets/{{document._id}}?transform=resize&width=80&height=80"/> {{ document.name }}</a>'
        },
        fields: [
            { name: 'name',
              type: 'text',
              label: 'Name'},
            { name: 'data',
              type: 'asset-data',
              label: 'File'},
            { name: 'metadata',
              type: 'asset-meta-data',
              label: 'MetaData'}
        ]
    });

	var app = express();

    var basePath = '/Assets';
	/*
	 *	Route to updload data to an asset
	 */
	app.post(basePath + '/:id', function (req, res) {
		var fileData,		//Holds various information about the uploaded file
			assetBuffer,	//The image data as buffer
			routeParams = req.route.params,	//The parameters of the route (:id)
			body        = req.body || {},
			id          = routeParams.id;

		Asset.findOne ({_id : id},'_id name',function (err,assetDocument) {   //Find the asset by its id in the monngodb
			if (err) { return next(err); }
			if (!assetDocument) { return next(); }

			assetDocument.metadata = assetDocument.metadata || {};   //Assign a default metadata  object

			if (body.name) {
				assetDocument.name = body.name;
			}

			if (body.data) {  //If the request contains an text/plain field named data instead of a file, its data is in the body field
				assetDocument.data = body.data;
				assetDocument.metadata['content-type'] = 'text/plain';
			}

			if (req.files && req.files.data) {	//If the request contains files, the data field, containing the information, is in the files member
				fileData           = req.files.data;
				assetBuffer        = fs.readFileSync (fileData.path); //the path member contains the temporary path to the image.
				assetDocument.data = assetBuffer;  //assign the image data as a buffer to the assets database entry

                if (!assetDocument.name && req.files.data.originalFilename) {
                    assetDocument.name = req.files.data.originalFilename; // set filename if empty
                }

				for ( var header in fileData.headers ) {  //The header field contains information such as the content type. Copy them to the metadata field.
					assetDocument.metadata [header] = fileData.headers [header];
				}

				assetDocument.metadata.size = fileData.size; //The size in bytes

				gm(assetBuffer).size(function (err, size) { //Computes the size of the uploaded image
					var	gcd,
						height = size.height,
						width  = size.width;

					if (err)  { return next(err); }

					gcd = utilities.gcd (width,height);

					assetDocument.metadata.width       = width;
					assetDocument.metadata.height      = height;
					assetDocument.metadata.aspectRatio = {
															value: width/height,
															text:	(width/gcd) + ':' + (height/gcd)
														 };

					removeCachedSubAssets (id); //If we update the data all cached versions need to be removed.
					saveAsset (assetDocument, res);
				});

			} else {
				saveAsset (assetDocument, res);
			}
		});
	});

	app.delete (basePath + '/:id', function (req){
		var routeParams = req.route.params,
			id = routeParams.id;
		removeCachedSubAssets (id, req);	//If the request gets passed, its next function gets called
	});

	/*
	 *  Removes all cached subassets which have the given id as its parentID
	 */
	function removeCachedSubAssets (id,req) {
		Asset.remove ({parentId:id},function (err) {
			if (err) { return next(err); }
			if (req) { req.next (); }
		});
	}

	/*
	 *  Mongoose save function, used by default
	 */
	function saveAsset (asset,res) {
		asset.save (function (err) {
			if (err) { return next(err); }
            var response = {
                _id: asset.id,
                metadata: asset.metadata,
                name: asset.name
            };
			return res.json(200, response);	//and send the response
		});
	}

	app.use(baucis());
	return app;
}
