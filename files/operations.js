var rightsMiddleware = require('./rightsMiddleware.js');
var fileUpload = require('./fileUpload.js');
var pathconfig = require('./pathconfig.js');
var path = require('path');
var fsOp = require('./fsOp.js');
var express = require('express');

module.exports = function (bauhausConfig) {
    'use strict';
    var app = express();

    /*var test = 'documents.Projects.fields';

    var arr = test.split('.');
    var bauhausConfigByDeep = [bauhausConfig];
    for (var i in arr) {
        var key = arr[i];
        if (bauhausConfigByDeep[i] != null && bauhausConfigByDeep[i][key] != null) {
            bauhausConfigByDeep.push(bauhausConfigByDeep[i][key]);
        }
    }
    //consol.log('bauhausConfigByDeep', bauhausConfigByDeep[bauhausConfigByDeep.length - 1]);*/

    app.use(function (req, res, next) {
        if (req.session != null && req.session.user != null && req.session.user.id != null) {
            next();
        } else {
            res.writeHead(403);
            res.json({
                "success": false,
                "info": "Upload failed!",
                "err": "NO LOGIN"
            });
        }
    });

    app.use(function (req, res, next) {
        if (req != null && req.body != null && req.body.data != null && typeof req.body.data === 'string') {
            try {
                req.jsonData = JSON.parse(req.body.data);
                next();
            } catch (err) {
                res.json({
                    "success": false,
                    "info": "Failed to parse JSON!",
                    "err": err
                });
            }
        } else {
            res.json({
                "success": false,
                "info": "Invalid request data!"
            });
        }
    });

    app.use(function (req, res, next) {
        if (req.jsonData.config != null && typeof req.jsonData.config === 'string' && req.jsonData.field != null && typeof req.jsonData.field === 'string') {
            var arr = req.jsonData.config.split('.');
            var bauhausConfigByDeep = [bauhausConfig];
            for (var i in arr) {
                var key = arr[i];
                if (bauhausConfigByDeep[i] != null && bauhausConfigByDeep[i][key] != null) {
                    bauhausConfigByDeep.push(bauhausConfigByDeep[i][key]);
                }
            }
            var config = bauhausConfigByDeep[bauhausConfigByDeep.length - 1];
            var foundIndex = -1;
            if (typeof config === 'object') {
                for (var i in config) {
                    if (config[i] != null && config[i].name != null) {
                        if (config[i].name == req.jsonData.field) {
                            foundIndex = i;
                            break;
                        }
                    }
                }
                if (foundIndex >= 0) {
                    //consol.log('found config', req.operationConfig);
                    req.operationConfig = config[i];
                    next();
                } else {
                    res.json({
                        "success": false,
                        "info": "Invalid config data! #3"
                    });
                }
            } else {
                res.json({
                    "success": false,
                    "info": "Invalid config data! #2"
                });
            }
        } else {
            res.json({
                "success": false,
                "info": "Invalid config data! #1"
            });
        }
    });

    app.use(function (req, res, next) {
        if (req.jsonData._id != null && typeof req.jsonData._id === 'string' && req.jsonData._id.search('/') < 0 && req.jsonData._id.search('.') === 0) {
            next();
        } else {
            res.json({
                "success": false,
                "info": "Invalid json config data! #4"
            });
        }
    });

    app.use('/upload', fileUpload());

    app.post('/fsop/upload', function (req, res) {

        var extension = 'jpg';
        var destName = req.operationConfig.options.dirname + req.operationConfig.options.filename;
        destName = destName.replace(':id', req.jsonData._id);
        if (!req.operationConfig.options.singlefile) {
            destName = destName.replace(':timestamp', Date.now());
        }
        destName = destName + '.' + extension;
        fsOp.uploadFile(destName, req.body.file, req.session.user.id, function (err) {
            if (err) {
                res.writeHead(500);
                res.json({
                    "success": false,
                    "info": "Upload failed!",
                    "err": err
                });
            } else {
                res.json({
                    "success": true,
                    "info": "Upload successful!"
                });
            }
        });
    });

    app.post('/fsop/removefiles', function (req, res) {
        if (req.jsonData.files != null) {
            var destDir = req.operationConfig.options.dirname.replace(':id', req.jsonData._id);
            var counter = 0;
            for (var i in req.jsonData.files)  {
                counter++;
                req.jsonData.files[i] = destDir + req.jsonData.files[i];
            }
            if (counter > 0) {
                fsOp.removeFiles(req.jsonData.files, function (err) {
                    if (err && err.length > 0) {
                        res.json({
                            "success": false,
                            "info": "Removing failed partly.",
                            "err": err
                        });
                    } else {
                        res.json({
                            "success": true,
                            "info": "Removing Successful!"
                        });
                    }
                });
            }
        }
    });

    app.post('/fsop/readdirsure', function (req, res) {
        //consol.log('rere', req.operationConfig);
        var destName = req.operationConfig.options.dirname;
        destName = destName.replace(':id', req.jsonData._id);
        if (!req.operationConfig.options.singlefile) {
            destName = destName.replace(':timestamp', Date.now());
        }
        fsOp.readDirSure(destName, function (err, files) {
            if (err && err.length > 0) {
                res.json({
                    "success": false,
                    "info": "Reading failed partly.",
                    "err": err
                });
            } else {
                res.json({
                    "success": true,
                    "info": "Reading Successful!",
                    "files": files
                });
            }
        });
    });

    return app;

}