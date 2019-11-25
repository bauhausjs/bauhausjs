//var multer = require('multer');
var multer = require('multer-pkgcloud');
var pkgcloudClient = require('./pkgCloudClient.js');
var express = require('express');
var rightSystem = require('./rightSystem.js');


module.exports = function (bauhausConfig) {
    'use strict';

    var app = express();
    var pkgclient = pkgcloudClient(bauhausConfig);

    app.use(function (req, res, next) {
        req.multerErrors = 0;
        req.accepts('*');
        next();
    });


    app.use(multer({
        pkgCloud: true,
        pkgCloudClient: pkgclient,
        changePkgOptions: function (options, filename, req, res) {
            var remote = "file";
            if (req.uploadFileName != null) {
                remote = req.uploadFileName;
            } else {
                remote = filename + "_"+Date.now();
            }
            if (req.uploadDir != null) {
                var containerArray = req.uploadDir.split('/');
                if (containerArray[0] === '') {
                    containerArray.shift();
                }
                if (containerArray[containerArray.length - 1] === '') {
                    containerArray.pop();
                }
                req.isPrivateFile = false;
                for (var i in containerArray) {
                    if (containerArray[i].toLowerCase() === 'private') {
                       req.isPrivateFile = true;
                    }
                }

                options.container = containerArray.join('.');
            }

            options.remote = remote;
            return options;
        },
        onFileUploadStart: function (file, req, res) {
            if (req.uploadTypeRegExp != null) {
                var regex = new RegExp(req.uploadTypeRegExp);
                return regex.test(file.mimetype);
            } else {
                return true;
            }
        },
        onFileUploadComplete: function (file, req, res) {
            req.multerUpload = true;

        },
        onError: function (err, req, res) {
            req.multerUpload = true;
            req.multerErrors++;
        }
    }));

    app.post('/', function (req, res, next) {
        if (req.files != null && req.files.file != null && req.multerUpload && req.multerErrors < 1) {
           //console.log('meta', req.multerContainer.metadata);
            rightSystem.setFileRights(req.uploadDir + req.files.file.remote, req.session.user.id, function (err) {
                if (err != null) {
                    console.error('Upload failed [bauhaus => fileUpload.js] #1', err);
                    res.json({
                        "success": false,
                        "info": "Upload failed!"
                    });
                } else {
                    // All files are private => add "false && "
                   if(false && req.isPrivateFile == false && req.multerContainer != null && req.multerContainer.metadata['x-readset'] !== 'true'){
                      //console.log('setright');
                      req.multerContainer.metadata['x-container-meta-x-readset'] = "true";
                       req.multerContainer.metadata['X-Container-Read'] = ".r:*";
                       pkgclient._updateContainerMetadata(req.multerContainer, req.multerContainer.metadata, function(err, container) {
                  			if (err) {
                               console.error('Upload failed [bauhaus => fileUpload.js] #2', err);
                               res.json({
                                   "success": false,
                                   "info": "Upload failed!"
                               });
                  			} else {
                              //console.log('done rig');
                               res.json({
                                   "success": true,
                                   "info": "Upload Successful!",
                                   "file": req.uploadDir + req.files.file.remote
                               });
                  			}
                  		});
                   } else {
                       res.json({
                           "success": true,
                           "info": "Upload Successful!",
                           "file": req.uploadDir + req.files.file.remote
                       });
                 }
                }
            });
        } else {
            res.json({
                "success": false,
                "info": "Upload failed!"
            });
        }
    });

    return app;

}
