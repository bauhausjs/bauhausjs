/*
 *	TODO: Clean up the code, remove conditions that use coercion such as !property
 *	TODO: Make the returned http statuses and responses consistent.
 */


var	fs      = require ('fs'),
	gm      = require ('gm').subClass({ imageMagick: true }),
	baucis  = require('baucis'),
	express = require('express');

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

function main (mongoose, asset) {
	'use strict';
	var assetController = baucis.rest({
		singular: asset.config.name,
		select:'name metadata transforms parentId',
		connection: mongoose.connection
	});

	var app = express();

	app.use('/' + asset.config.name + 's/info', function (req, res) {
			res.json(asset.config);
	});

	/*
	 *	Route to updload data to an asset
	 */
	app.post('/' + asset.config.name + 's/:id', function (req, res) {
		var	fileData,		//Holds various information about the uploaded file
			assetBuffer,	//The image data as buffer
			routeParams = req.route.params,	//The parameters of the route (:id)
			body        = req.body || {},
			id          = routeParams.id;

		asset.model.findOne ({_id : id},'_id',function (err,assetDocument) {   //Find the asset by its id in the monngodb
			if (err) { throw err; }
			if (!assetDocument) { return; }

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


				for ( var header in fileData.headers ) {  //The header field contains information such as the content type. Copy them to the metadata field.
					assetDocument.metadata [header] = fileData.headers [header];
				}

				assetDocument.metadata.size = fileData.size; //The size in bytes

				gm(assetBuffer).size(function (err, size) { //Computes the size of the uploaded image
					var	gcd,
						height = size.height,
						width  = size.width;

					if (err)  { throw err; }

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

	/*
	 *	Route to view the assets
	 *
	 */
	app.get ('/' + asset.config.name + 's/:id/view', function (req, res) {
		var	routeParams = req.route.params,
			id          = routeParams.id,
			query       = req.query; //contains the urls query parameters

		asset.model.findOne ({_id : id},'name metadata data',function (err,assetDocument) {
			var options;

			if (err) { throw err; }
			if (!assetDocument) { return; }

			options = {};

			if (typeof query.transform !==  'undefined') {
				options.transform = {
					width : query.width,
					height: query.height,
					cropCoords: query.cropCoords,	//cropping coords left - top :  right - bottom  e.g: [[20,20],[30,30]] cuts 20px from the left and top, and 30 px from right and bottom
					scale_mode: query.scale_mode?query.scale_mode:'fit',	//gm options for resizing, "!" forces a resize, ignoring the original aspect ratio
					transform: query.transform	//optional transformation order ['resize','crop']
				};
			}
			sendAsset (res, assetDocument, options);
		});

	});

	app.delete ('/' + asset.config.name + 's/:id', function (req){
		var	routeParams = req.route.params,
			id          = routeParams.id;
		removeCachedSubAssets (id,req);	//If the request gets passed, its next function gets called
	});

	/*
	 *  Removes all cached subassets which have the given id as its parentID
	 */
	function removeCachedSubAssets (id,req) {
		asset.model.remove ({parentId:id},function (err) {
			if (err) { throw err; }
			if (req) { req.next (); }
		});
	}

	/*
	 *  Mongoose save function, used by default
	 */
	function saveAsset (asset,res) {
		asset.save (function (err) {
			if (err) { throw err; }
			res.writeHead ('200');	//set the http status to 200 if the save succeeded		
			res.end ();	//and send the response
		});
	}

	/*
	 *  Sends the buffer of the asset to the client.
	 *  Accepts options to perform transformations on the asset.
	 */
	function sendAsset (res,assetDocument,options) {
		var data,
			id;

		if (assetDocument.metadata && assetDocument.metadata['content-type']) {
			res.setHeader('Content-Type', assetDocument.metadata['content-type']);
		} else {
			res.setHeader('Content-Type', 'text/plain');
		}

		data = assetDocument.data;
		  id = assetDocument.id;


		/*
		 *	Performs transformations on an image
		 *	TODO: Think about a more generic way to perform other transformations.
		 *	TODO: Implement filters
		 */
		if (options && options.transform)  {
			var aspectRatio    = assetDocument.metadata.aspectRatio.value,
				width          = parseInt (options.transform.width,10) || assetDocument.metadata.width,  //Use the original values, since the transformation uses the lower value, aspect ratio gets corrected
				height         = parseInt (options.transform.height,10) || assetDocument.metadata.height,
				scale_mode     = options.transform.scale_mode==='fit'?'':'!', //gm accepts an third parameter "options" which forces a resize when set to '!'
				cropCoords     = options.transform.cropCoords,
				transformData  = {},  // contains the data, applied to their respectice transform function from gm
				transformOrder = options.transform.length?options.transform:["resize","crop"], //Weakly match length to filter all falsy values, if no transform order was specified, use the default one.
				cleanedCoords  = [], // [width,height,x,y]
				parsedCoords, //JSON parsed cropCoords
				gmInstance,
				tmpCond, //used to temporarily assign test conditions
				query,
				max;


			/*
			 *  preserve the right values for width and height, to match the aspect ratio if scale mode is fit
			 *	We need to normalize the data to e.g. get the same cached version for w: 50 h: 7889 and w:50 h: 123
			 */

			if (scale_mode !== '!') { //'' == false.
				max = Math.max (width,height);
				if (width === max) { 
					width  = Math.round (height * aspectRatio);	//Round it if the aspect ratio * height is not an int
				} else if (height === max) {
					height = Math.round (width / aspectRatio);
				}
			}



			//If the aspect ratio matches the original, scale_mode:fill should be corrected, to make sure the cached assets are the same
			if (width / height === aspectRatio) {
				scale_mode = '';
			}

			// reformat the cropcoords vlaue to be able to directly apply it on the crop function of gm
			if (typeof cropCoords !== 'undefined') {
				try {
					parsedCoords = JSON.parse (cropCoords);

					//The sum of the cropcoords, only a value > 0 makes sense...
					tmpCond = parsedCoords.reduce (function sum (a,b) {
						return a + (Array.isArray (b)?b.reduce (sum,0):b);
					},0);

					//TODO: Handle negative new width and rheight values
					if (tmpCond > 0) {
						cleanedCoords [0] = assetDocument.metadata.width - parsedCoords [1][0];	//new width
						cleanedCoords [1] = assetDocument.metadata.height - parsedCoords [1][1];	//new height
						cleanedCoords [2] = parsedCoords [0][0];	//x
						cleanedCoords [3] = parsedCoords [0][1];	//y
					}

					tmpCond = null;
				} catch (e) {
					//don't crop the image if false values have been passed
				}
			}


			//If the recaalculated width and height either match the original size or are larger, use the original image.
			if (width >= assetDocument.metadata.width && height >= assetDocument.metadata.height && cleanedCoords.length === 0) {
				res.writeHead(200);
				return  res.end(data);
			}


			query = {
				parentId: id,
				'transforms.width':width,
				'transforms.height':height,
			 	'transforms.scale_mode':scale_mode,
			 	'transforms.cropCoords': cleanedCoords,
			 	'transform.transformOrder': transformOrder
			 };	//The query to find the cached version, if existent


			
			asset.model.findOne (query,'parentId transforms data', function (err, cachedAssetDocument) {
				if (!cachedAssetDocument) {	//If no transformed asset exists with the given parameters
					cachedAssetDocument = new asset.model ();	//we create a new one, and save it in the mongodb

					//Define the data that should be passed to the different transformation methods
					transformData.resize = [width, height, scale_mode];
					transformData.crop = cleanedCoords;

					gmInstance = gm (data);


					/*	Iterate over the transformations that shopuld be performed, in their (optionally) defined order.
					 *	check if we have a defined dataset that can be applied to the transformation
					 *	and if the data exists
					 */
					for (var i = 0,transformation,currentData; i < transformOrder.length; i++) {
						transformation = transformOrder [i];
						currentData = transformData [transformation];
						if (currentData && currentData.length > 0) {
							gmInstance [transformation].apply (gmInstance, currentData);
						}
					}


					//When the transformations were applied, save the resulting image and return its buffer
					gmInstance.toBuffer (function (err,buffer) {
						if (err) { throw err; }

						cachedAssetDocument.data       = buffer;
						cachedAssetDocument.parentId   = id;
						cachedAssetDocument.transforms = {
							width: width,
							height: height,
							cropCoords: cleanedCoords,
							transformaOrder: transformOrder,
							scale_mode: scale_mode
						};

						cachedAssetDocument.save ( function (err) {
							if (err) { throw err; }
							res.send (buffer);
						});
					});
				} else {  //Otherwise send back the cached version
					res.send (cachedAssetDocument.data);
				}
			});
		} else {
			res.writeHead(200);
			return  res.end(data);
		}
	}

	app.use(baucis());
	return app;
}