var pathconfig = require('./pathconfig.js');
var multer = require('multer');
var fsOp = require('./fsOp.js');
var express = require('express');
var rightSystem = require('./rightSystem.js');

module.exports = function (req, res, next) {
    'use strict';

    var app = express();

    app.use(function (req, res, next) {
        req.accepts('*');
        next();
    });

    app.use(multer({
        dest: pathconfig.uploadDir,
        rename: function (fieldname, filename) {
            return pathconfig.changeFileName(filename);
        },
        onFileUploadStart: function (file) {
            //console.log(file.originalname + ' is starting ...')
        },
        onFileUploadComplete: function (file) {
            //console.log(file.fieldname + ' uploaded to  ' + file.path)
            //done = true;
        }
    }));

    app.post('/', function (req, res, next) {

        if (req.body && req.body.data && req.files && req.files.file && req.files.file.path && req.session != null && req.session.user != null && req.session.user.id != null) {
            try {
                var data = JSON.parse(req.body.data);
            } catch (err) {
                return res.json({
                    "success": false,
                    "info": "Upload failed! Path invalid! JSON.parse failed!",
                    "err": err
                });
            }

            var files = [{
                'src': pathconfig.uploadSubDir + '/' + req.files.file.name,
                'dest': data.path + req.files.file.name
            }];

            //console.log('fief', files);

            fsOp.moveFiles(files, function (err) {
                if (err && err.length > 0) {
                    res.json({
                        "success": false,
                        "info": "Upload failed! Moving file failed.",
                        "err": err
                    });
                } else {
                    rightSystem.setFileRights(files[0].dest, req.session.user.id, function (err) {
                        if (err) {
                            res.json({
                                "success": false,
                                "info": "Upload failed! Setting Uploader failed.",
                                "err": err
                            });
                        } else {
                            res.json({
                                "success": true,
                                "info": "Upload Successful!"
                            });
                        }
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