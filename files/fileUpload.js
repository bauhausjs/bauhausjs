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

            var remote = req.operationConfig.options.filename;
            remote = remote.replace(':id', req.jsonData._id);
            if (!req.operationConfig.options.singlefile) {
                remote = remote.replace(':timestamp', Date.now());
            }
            var container = req.operationConfig.options.container;
            container = container.replace(':id', req.jsonData._id);
            if (!req.operationConfig.options.singlefile) {
                container = container.replace(':timestamp', Date.now());
            }
            options.container = container;
            options.remote = remote;
            return options;
        },
        onFileUploadStart: function(file, req, res){
            var regex = new RegExp(req.operationConfig.options.typeRegEx);
            return regex.test(file.mimetype);
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
            rightSystem.setFileRights(req.files.file.container + '/' + req.files.file.remote, req.session.user.id, function (err) {
                if (err != null) {
                    res.json({
                        "success": false,
                        "info": "Upload failed!",
                        "err": err
                    });
                } else {
                    res.json({
                        "success": true,
                        "info": "Upload Successful!"
                    });
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