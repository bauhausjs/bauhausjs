var rightsMiddleware = require('./rightsMiddleware.js');
var fileUpload = require('./fileUpload.js');
var pkgcloudClient = require('./pkgCloudClient.js');
var rightSystem = require('./rightSystem.js');
var express = require('express');

module.exports = function (bauhausConfig) {
    'use strict';
    var app = express();
    var pkgclient = pkgcloudClient(bauhausConfig);

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
        if (req != null && req.query != null && req.query.data != null && typeof req.query.data === 'string') {
            try {
                req.jsonData = JSON.parse(req.query.data);
                //console.log(req.jsonData);
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

    app.use('/upload', fileUpload(bauhausConfig));

    app.post('/fsop/removefile', function (req, res) {
        if (req.jsonData.file != null) {
            var container = req.operationConfig.options.container.replace(':id', req.jsonData._id);
            var file = req.jsonData.file;
            //console.log('del', container, file);

            pkgclient.removeFile(container, file, function (err) {
                if (err && err.length > 0) {
                    res.json({
                        "success": false,
                        "info": "Removing from cloud failed.",
                        "err": err
                    });
                } else {
                    rightSystem.removeFiles([container + '/' + file], function (err) {
                        if (err) {
                            res.json({
                                "success": false,
                                "info": "Removing from rightSystem failed.",
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
            });
        }
    });

    app.post('/fsop/readcontainersure', function (req, res) {
        //consol.log('rere', req.operationConfig);
        var container = req.operationConfig.options.container;
        container = container.replace(':id', req.jsonData._id);
        if (!req.operationConfig.options.singlefile) {
            container = container.replace(':timestamp', Date.now());
        }
        pkgclient.createContainer({
            'name': container
        }, function (err, containerRet) {
            if (err) {
                res.json({
                    "success": false,
                    "info": "Reading/Creating container failed.",
                    "err": err
                });
            } else {
                pkgclient.getFiles(container, function (err, files) {
                    if (err) {
                        res.json({
                            "success": false,
                            "info": "Reading files failed.",
                            "err": err
                        });
                    } else {
                        res.json({
                            "success": true,
                            "info": "Reading Successful!",
                            "files": files
                        });
                    };
                });
            }
        });
    });

    return app;

}