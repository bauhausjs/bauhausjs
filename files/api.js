var express = require('express');
var db = require('./databaseOperations.js');
var pfs = require('./pragmFileSystem.js');
var File = require('./model/file');
var count = 0;

module.exports = function (bauhausConfig) {
    // Register document for CRUD generation
    bauhausConfig.addDocument('Files', {
        name: 'File',
        model: 'File',
        collection: 'files',
        url: "files",
        query: {
            conditions: {
                parentId: null
            }
        }
    });

    var app = express();
    var pre = "/files";

    function getGCD(nominator, denominator) {
        'use strict';
        return ((nominator > 0) ? getGCD(denominator % nominator, nominator) : denominator);
    }

    app.get(pre + '/test', function (req, res, next) {
        pfs.init().then(function (data) {
            res.json({
                "info": "LOL successful!",
                "id": data
            });
        }, function (err) {
            res.json({
                "info": "LOL unsuccessful!",
                "id": err
            });
        });
    });

    app.post(pre + '/upload/:id', function (req, res) {
        req.accepts('*');
        try {
            var routeParams = req.route.params;
            var id = routeParams.id;
            var body = req.body || {};
            var dataUrl = body.image;
            var data = JSON.parse(body.data);
            var dataString = dataUrl.split(",");
            var buffer = new Buffer(dataString[1], 'base64');
            var contentType = dataString[0].split(":")[1];
            contentType = contentType.split(";")[0];

            var width = data.kw - data.kw % 1; // Abrunden
            var height = data.kh - data.kh % 1; // Abrunden
            var gcd = getGCD(width, height);

            var metadata = {
                "content-type": contentType,
                "width": width,
                "height": height,
                "aspectRatio": {
                    value: width / height,
                    text: (width / gcd) + ':' + (height / gcd)
                }
            };

            db.setFileData(id, buffer, metadata).then(function (data) {
                db.deleteCached(id).then(function(data){
                    console.log("deleteCached: "+data);
                }, function(err){
                    console.log("deleteCached: ERROR: "+err);
                });
                res.json({
                    "info": "Upload successful!",
                    "id": data
                });
            }, function (err) {
                console.error(err);
                res.writeHead(500);
                res.end("Some Database problem!");
            });
        } catch (err) {
            console.error(err);
            res.writeHead(500);
            res.json("May DataURL corrupt!");
        }
    });

    app.get(pre + '/list', function (req, res) {
        req.accepts('*');
        res.json({
            "success": true,
            "dirObject": pfs.dirObject
        });
    });

    app.post(pre + '/fop', function (req, res) {
        req.accepts('*');
        var routeParams = req.route.params;
        var id = routeParams.id;
        var body = req.body || {};
        var data = JSON.parse(body.data) || {};
        console.log(data);
        if (data.op) {
            switch (data.op) {
            case "add":
                pfs.addFile(data.name, data.dir, data.type).then(function (data) {
                    res.json({
                        "success": true,
                        "data": data,
                        "dirObject": pfs.dirObject
                    });
                }, function (err) {
                    res.json({
                        "success": false,
                        "error": err
                    });
                });
                break;
            case "changename":
                pfs.changeName(data.id, data.name).then(function (data) {
                    res.json({
                        "success": true,
                        "data": data,
                        "dirObject": pfs.dirObject
                    });
                }, function (err) {
                    res.json({
                        "success": false,
                        "error": err
                    });
                });
                break;
            case "copy":
                pfs.copyFileList(data.copyobject).then(function (data) {
                    res.json({
                        "success": true,
                        "data": data,
                        "dirObject": pfs.dirObject
                    });
                }, function (err) {
                    res.json({
                        "success": false,
                        "error": err
                    });
                });
                break;
            case "move":
                pfs.moveFileList(data.moveobject).then(function (data) {
                    res.json({
                        "success": true,
                        "data": data,
                        "dirObject": pfs.dirObject
                    });
                }, function (err) {
                    res.json({
                        "success": false,
                        "error": err
                    });
                });
                break;
            case "delete":
                pfs.deleteList(data.deleteobject).then(function (data) {
                    res.json({
                        "success": true,
                        "data": data,
                        "dirObject": pfs.dirObject
                    });
                }, function (err) {
                    res.json({
                        "success": false,
                        "error": err
                    });
                });
                break;
            case "list":
                if (pfs.dirObject) {
                    res.json({
                        "success": true,
                        "dirObject": pfs.dirObject
                    });
                } else {
                    res.json({
                        "success": false,
                        "error": "DirObject not defined!"
                    });
                }
                break;
            }
        } else {
            res.json({
                "success": false,
                "error": "No Operation"
            });
        }
    });

    app.post(pre + '/add', function (req, res) {
        req.accepts('*');
        var routeParams = req.route.params;
        var id = routeParams.id;
        var body = req.body || {};
        if (body.name && body.type) {
            var name = body.name;
            var parent = body.parent;
            var type = parseInt(body.type);
            db.addFile(name, type, parent).then(function (data) {
                res.json({
                    "data": data
                });
            }, function (err) {
                console.error("ERROR: " + err);

                res.json({
                    "lol": 42 + count
                });
            });
        }

        res.json({
            "lol": 42 + count
        });
    });

    app.post(pre + '/changename', function (req, res) {
        req.accepts('*');
        var routeParams = req.route.params;
        var id = routeParams.id;
        var body = req.body || {};

        res.json({
            "lol": 42 + count
        });
    });

    app.post(pre + '/copy', function (req, res) {
        req.accepts('*');
        var routeParams = req.route.params;
        var id = routeParams.id;
        var body = req.body || {};

        res.json({
            "lol": 42 + count
        });
    });

    app.post(pre + '/move', function (req, res) {
        req.accepts('*');
        var routeParams = req.route.params;
        var id = routeParams.id;
        var body = req.body || {};

        res.json({
            "lol": 42 + count
        });
    });

    app.post(pre + '/delete', function (req, res) {
        req.accepts('*');
        var routeParams = req.route.params;
        var id = routeParams.id;
        var body = req.body || {};

        res.json({
            "lol": 42 + count
        });
    });

    app.get('/Filesp', function (req, res) {
        req.accepts('*');
        /*db.addFile("SUPIFOLDER",2).then(function(data){
            console.log("MY NEW ID: "+data);
            db.getFilesInfoWithoutBuffer();
        }, function(err){
            console.log('error lol');
            console.log(err);
        });*/
        db.copyFile('542822426127f3c2522ed24f', "neutest").then(function (data) {
            console.log(data);
            res.json({
                "dat": data
            });
        }, function (err) {
            console.error(err);
            res.json({
                "err": err
            });
        });


        /*db.getFilesInfoWithoutBuffer().then(function(data){
            console.log(data);
        }, function(err){
            console.error(err);
        });*/
        /*pfs.saveAll().then(function (data) {
            count++;
            res.json({
                "lol": count,
                "dat": data
            });
        }, function (err) {
            count++;
            res.json({
                "lol": count,
                "err": err
            });
        });*/
    });

    return app;
}