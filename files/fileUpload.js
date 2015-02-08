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

            var extension = req.files.file.name.split('.').pop().toLowerCase();
            var destName = req.operationConfig.options.dirname+req.operationConfig.options.filename;
            destName = destName.replace(':id', req.jsonData._id);
            if (!req.operationConfig.options.singleFile) {
                destName = destName.replace(':timestamp', Date.now());
            }
            destName = destName + '.' + extension;

            var files = [{
                'src': pathconfig.uploadSubDir + '/' + req.files.file.name,
                'dest': destName
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