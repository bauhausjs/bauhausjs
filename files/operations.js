var rightsMiddleware = require('./rightsMiddleware.js');
var fileUpload = require('./fileUpload.js');
var pkgcloudClient = require('./pkgCloudClient.js');
var rightSystem = require('./rightSystem.js');
var express = require('express');
var mongoose = require('mongoose');



module.exports = function (bauhausConfig) {
    'use strict';
    var app = express();
    var pkgclient = pkgcloudClient(bauhausConfig);


    var addMiddleware = function (modelName) {
        mongoose.models[modelName].schema.post('remove', function (doc) {
            if (doc._id) {
                var modelWithS;
                for (var i in bauhausConfig.documents) {
                    if (bauhausConfig.documents[i].model === modelName && i !== "") {
                        modelWithS = i;
                        break;
                    }
                }
                if (modelWithS != null) {
                    var searchRegEx = "documents." + modelWithS + "." + doc._id + "[.]*";

                    rightSystem.removeAllSubFiles('/documents/' + modelWithS + '/' + doc._id, function (err) {
                        if (err) {
                            console.error('failed to remove Filerights for ' + modelName + ' ' + doc._id + ' ', err);
                        }
                    });

                    pkgclient.getContainers(function (err, containers) {
                        if (err) {
                            console.error('Failed to load containers for delete');
                        } else {
                            for (var i in containers) {
                                if (RegExp(searchRegEx).test(containers[i].name)) {
                                    pkgclient.destroyContainer(containers[i].name, function (err, result) {
                                        if (err != null || result === false) {
                                            console.error('Failed to destroy Container: ', err, result);
                                        }
                                    });
                                }
                            }
                        };
                    });
                } else {
                    console.error('Could not find modelWithS');
                }
            }
        });
    }

    // Add Post Remove Middleware to all models to check if files needed to get deleted
    //console.log(mongoose.modelSchemas);
    for (var model in mongoose.models) {
        addMiddleware(model);
    }

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
                });
            }
        } else {
            res.json({
                "success": false,
                "info": "Invalid request data!"
            });
        }
    });

    // Check if ID exists
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

    // Search field config in bauhausConfig
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
            if (config != null && typeof config === 'object' && config.fields != null && typeof config.fields === 'object') {
                for (var i in config.fields) {
                    if (config.fields[i] != null && config.fields[i].name != null) {
                        if (config.fields[i].name == req.jsonData.field) {
                            foundIndex = i;
                            break;
                        }
                    }
                }
                if (foundIndex >= 0) {
                    //consol.log('found config', req.operationConfig);
                    req.operationConfig = config.fields[i];
                    req.documentConfig = config;
                    var fieldNameArray = config.fields[i].name.split('.');
                    if (arr[arr.length - 1] === "fields") {
                        arr.pop();
                    }
                    if (fieldNameArray[0] === "fields") {
                        fieldNameArray.shift();
                    }
                    arr.push(req.jsonData._id);
                    req.documentPath = arr.join('/') + '/' + req.jsonData._id;
                    var containerArray = arr.concat(fieldNameArray);
                    req.containerName = containerArray.join('.');
                    req.containerPath = '/' + containerArray.join('/') + '/';


                    if (req.operationConfig.options.filename != null) {
                        req.uploadFileName = req.operationConfig.options.filename.replace(':id', req.jsonData._id);
                        if (!req.operationConfig.options.singlefile) {
                            req.uploadFileName = req.uploadFileName.replace(':timestamp', Date.now());
                        }
                    }

                    if (req.operationConfig.options.typeRegEx != null) {
                        req.uploadTypeRegExp = req.operationConfig.options.typeRegEx;
                    }

                    req.uploadDir = req.containerPath;

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

    // Check if ID exists in datamodel
    app.use(function (req, res, next) {
        if (mongoose.models != null && req.documentConfig != null && req.documentConfig.model != null && mongoose.models[req.documentConfig.model]) {
            mongoose.models[req.documentConfig.model].findOne({
                _id: req.jsonData._id
            }, function (err, data) {
                if (err == null && data._id) {
                    next();
                } else {
                    res.json({
                        "success": false,
                        "info": "Invalid json config data! #6"
                    });
                }
            });
        } else {
            res.json({
                "success": false,
                "info": "Invalid json config data! #5"
            });
        }
    });

    app.use('/upload', fileUpload(bauhausConfig));

    app.post('/fsop/removefile', function (req, res) {
        if (req.jsonData.file != null) {
            //var container = req.operationConfig.options.container.replace(':id', req.jsonData._id);
            var container = req.containerName;
            var file = req.jsonData.file;
            //console.log('del', container, file);

            pkgclient.removeFile(container, file, function (err) {
                if (err && err.length > 0) {
                    res.json({
                        "success": false,
                        "info": "Removing from cloud failed."
                    });
                } else {
                    rightSystem.removeFiles([req.containerPath + file], function (err) {
                        if (err) {
                            res.json({
                                "success": false,
                                "info": "Removing from rightSystem failed."
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
        var container = req.containerName;
        /*var container = req.operationConfig.options.container;
        container = container.replace(':id', req.jsonData._id);
        if (!req.operationConfig.options.singlefile) {
            container = container.replace(':timestamp', Date.now());
        }*/
        console.log(container);
        pkgclient.createContainer({
            'name': container
        }, function (err, containerRet) {
            //console.log('container', containerRet);
            if (err) {
                console.log('err', err);
                res.json({
                    "success": false,
                    "info": "Reading/Creating container failed."
                });
            } else {
                pkgclient.getFiles(container, function (err, files) {
                    if (err) {
                        res.json({
                            "success": false,
                            "info": "Reading files failed."
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