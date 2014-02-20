var fs      = require ('fs'),
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
		var fileData,		//Holds various information about the uploaded file
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
					var gcd,
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
		var routeParams = req.route.params,
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
					scale_mode: query.scale_mode?query.scale_mode:'fit'	//gm options for resizing, "!" forces a resize, ignoring the original aspect ratio
				};
			}
			sendAsset (res, assetDocument, options);
		});

	});

	app.delete ('/' + asset.config.name + 's/:id', function (req){
		var routeParams = req.route.params,
			id     = routeParams.id;
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
		 *  Performs transformations on an image
		 *
		 */
		if (options && options.transform)  {
			var aspectRatio = assetDocument.metadata.aspectRatio.value,
				width       = parseInt (options.transform.width),
				height      = parseInt (options.transform.height),
				scale_mode  = options.transform.scale_mode==='fit'?'':'!', //gm accepts an third parameter "options" which forces a resize when set to '!'
				query,
				max;

			if (!width && !height)	{
				res.writeHead (400);
				res.end ();
			}

			/*
			 *  preserve the right values for width and height, to match the aspect ratio if scale mode is fit
			 *	We need to normalize the data to e.g. get the same cached version for w: 50 h: 7889 and w:50 h: 123
			 *  If The Scale Mode is not "fit" and one of the attributes are missing, we need to calcucalate them. So they don't stay at 0
			 *  Note: width !== width === NaN !== NaN
			 */

			if (!scale_mode || !width || !height) { //'' == false.
				max = Math.max (width,height);
				if (width !== width || width === max) {
					width  = Math.round (height * aspectRatio);	//Round it if the aspect ratio * height is not an int
				} else if (height !== height || height === max) {
					height = Math.round (width / aspectRatio);
				}
			}

			query = {parentId: id,'transforms.width':width,'transforms.height':height};	//The query to find the cached version, if existent

			asset.model.findOne (query,'parentId transforms data', function (err, cachedAssetDocument) {
				if (!cachedAssetDocument) {	//If no transformed asset exists with the given parameters
					cachedAssetDocument = new asset.model ();	//we create a new one, and save it in the mongodb

					gm (data).resize(width, height, scale_mode).toBuffer (function (err,buffer) {
						if (err) { throw err; }

						cachedAssetDocument.data       = buffer;
						cachedAssetDocument.parentId   = id;
						cachedAssetDocument.transforms = {
							width: width,
							height: height,
							scale_mode: scale_mode
						};

						cachedAssetDocument.save ( function (err) {
							if (err) { throw err; }

							console.log ('Created new Asset');
							res.send (buffer);
						});
					});
				} else {  //Otherwise send back the cached version
					console.log ('Used cached version');
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