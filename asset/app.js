var gm      = require ('gm').subClass({ imageMagick: true }),
    express = require('express'),
    Asset   = require('./model/asset');

/**
 * Returns express middleware which retruns assets with stored mime type
 *
 */
module.exports = function (bauhausConfig) {
    'use strict';

    var app = express();

    app.param('id', function (req, res, next, id) {

        if (typeof id === 'string' && id.length === 24) {
            return next();
        } else {
            return next(new Error('Invalid Asset id'));
        }
    });

    /*
     *	Route to view the assets
     *
     */
    app.get('/:id', function (req, res, next) {
        var routeParams = req.route.params,
            id          = routeParams.id,
            query       = req.query; //contains the urls query parameters

        Asset.findOne ({_id : id},'name metadata data',function (err,assetDocument) {
            var options;

            if (err) { return next(err); }  // Mongo error
            if (!assetDocument) { return next(); } // No asset found
            if (assetDocument && !assetDocument.data) { return next(); } // Asset has no content
            if (assetDocument && assetDocument.metadata && !assetDocument.metadata['content-type']) { return next(); } // Asset has no metadata

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
            var aspectRatio       = assetDocument.metadata.aspectRatio.value,
                width             = parseInt (options.transform.width,10) || assetDocument.metadata.width,  //Use the original values, since the transformation uses the lower value, aspect ratio gets corrected
                height            = parseInt (options.transform.height,10) || assetDocument.metadata.height,
                scale_mode        = options.transform.scale_mode==='fit'?'':'!', //gm accepts an third parameter "options" which forces a resize when set to '!'
                transformData     = {},  // contains the data, applied to their respectice transform function from gm
                transformOrderDef = ["resize","crop"], //The default transformorder
                transformOrder    = options.transform.transform, //Weakly match length to filter all falsy values, if no transform order was specified, use the default one.
                cropCoords        = options.transform.cropCoords,
                cleanedCoords  = [], // [width,height,x,y]
                cropSize,
                parsedCoords, //JSON parsed cropCoords
                gmInstance,
                tmpCond, //used to temporarily assign test conditions
                query,
                max;

            //Parse the transformorder
            if (transformOrder) {
                try {
                    transformOrder = JSON.parse (transformOrder); //Should be assigned to its own variable
                } catch (e) {
                    transformOrder = transformOrderDef;
                }
            } else {
                transformOrder = transformOrderDef;
            }

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
            if ((width / height).toPrecision (5) === aspectRatio.toPrecision (5)) {
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

                    if (transformOrder.indexOf ("crop") > transformOrder.indexOf ("resize")) {
                        cropSize = [width,height];   //If the cropping should happen after the resizing, we should use the resized images width and height for reference
                    } else {
                        cropSize = [assetDocument.metadata.width,assetDocument.metadata.height]; //otherwise we use the original image size as reference for the cropping
                    }

                    //TODO: Handle negative new width and rheight values
                    if (tmpCond > 0) {
                        cleanedCoords [0] = cropSize [0] - parsedCoords [1][0];	//new width
                        cleanedCoords [1] = cropSize [1] - parsedCoords [1][1];	//new height
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
                 'transforms.transformOrder': transformOrder
             };	//The query to find the cached version, if existent


            Asset.findOne (query,'parentId transforms data', function (err, cachedAssetDocument) {
                if (!cachedAssetDocument) {	//If no transformed asset exists with the given parameters
                    cachedAssetDocument = new Asset ();	//we create a new one, and save it in the mongodb

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
                        if (err) { return next(err); }

                        cachedAssetDocument.data       = buffer;
                        cachedAssetDocument.parentId   = id;
                        cachedAssetDocument.transforms = {
                            width: width,
                            height: height,
                            cropCoords: cleanedCoords,
                            transformOrder: transformOrder,
                            scale_mode: scale_mode
                        };

                        cachedAssetDocument.save ( function (err) {
                            if (err) { return next(err); }
                            return res.send (buffer);
                        });
                    });
                } else {  //Otherwise send back the cached version
                    return res.send (cachedAssetDocument.data);
                }
            });
        } else {
            res.writeHead(200);
            return res.end(data);
        }
    }

    return app;
};
