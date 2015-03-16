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

            rightSystem.setFileRights(req.uploadDir + req.files.file.remote, req.session.user.id, function (err) {
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