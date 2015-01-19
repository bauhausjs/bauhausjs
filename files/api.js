var express = require('express');
//var db = require('./databaseOperations.js');
//var pfs = require('./pragmFileSystem.js');
//var File = require('./model/file');
var pathconfig = require('./pathconfig.js');
var fsOp = require('./fsOp.js');
var fileUpload = require('./fileUpload.js');
var Project = require('../../../lib/project/model/project.js');

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

    app.use(pre + '/fsop', function (req, res, next) {
        try {
            req.fsopdata = JSON.parse(req.body.data);
            next();
        } catch (err) {
            res.json({
                "success": false,
                "info": "Failed to parse JSON!",
                "err": err
            });
        }
    });

    app.use(pre + '/upload', fileUpload());


    //app.use(express.bodyParser({limit: '900mb'}));

    app.post(pre + '/fsop/upload', function (req, res) {
        if (req.session != null && req.session.user != null && req.session.user.id != null) {
            fsOp.uploadFile(req.fsopdata.dir, req.fsopdata.name, req.body.file, req.session.user.id, function (err) {
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
        } else {
            res.writeHead(403);
            res.json({
                "success": false,
                "info": "Upload failed!",
                "err": "NO LOGIN"
            });
        }
    });

    app.post(pre + '/fsop/movefiles', function (req, res) {
        fsOp.moveFiles(req.fsopdata.files, function (err) {
            if (err && err.length > 0) {
                res.json({
                    "success": false,
                    "info": "Moving failed partly.",
                    "err": err
                });
            } else {
                res.json({
                    "success": true,
                    "info": "Moving Successful!"
                });
            }
        });
    });

    app.post(pre + '/fsop/copyfiles', function (req, res) {
        fsOp.copyFiles(req.fsopdata.files, function (err) {
            if (err && err.length > 0) {
                res.json({
                    "success": false,
                    "info": "Copying failed partly.",
                    "err": err
                });
            } else {
                res.json({
                    "success": true,
                    "info": "Copying Successful!"
                });
            }
        });
    });

    app.post(pre + '/fsop/removefiles', function (req, res) {
        fsOp.removeFiles(req.fsopdata.files, function (err) {
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
    });

    app.post(pre + '/fsop/createdir', function (req, res) {
        fsOp.createDir(req.fsopdata.dir, function (err) {
            if (err && err.length > 0) {
                res.json({
                    "success": false,
                    "info": "Creating failed partly.",
                    "err": err
                });
            } else {
                res.json({
                    "success": true,
                    "info": "Creating Successful!"
                });
            }
        });
    });

    app.post(pre + '/fsop/readdir', function (req, res) {
        fsOp.readDir(req.fsopdata.dir, function (err, files) {
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

    app.post(pre + '/fsop/readdirsure', function (req, res) {
        fsOp.readDirSure(req.fsopdata.dir, function (err, files) {
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

    app.post(pre + '/fsop/rename', function (req, res) {
        fsOp.rename(req.fsopdata.oldPath, req.fsopdata.newPath, function (err) {
            if (err && err.length > 0) {
                res.json({
                    "success": false,
                    "info": "Renameing failed partly.",
                    "err": err
                });
            } else {
                res.json({
                    "success": true,
                    "info": "Renameing Successful!"
                });
            }
        });
    });

    app.post(pre + '/fsop/getProjectNameById', function (req, res) {
        Project.findById(req.fsopdata.id, function (err, project) {
            if (err) {
                res.json({
                    "success": false,
                    "info": "Failed",
                    "err": err
                });
            } else {
                if (!project) {
                    res.json({
                        "success": false,
                        "info": "Failed"
                    });
                } else {
                    res.json({
                        "success": true,
                        "name": project.title
                    });
                }
            }
        });
    });

    //app.post(pre + '/upload/:id', function (req, res) {
    //   fop.upload(req, res);
    /*req.accepts('*');
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
                db.deleteCached(id).then(function (data) {
                    console.log("deleteCached: " + data);
                }, function (err) {
                    console.log("deleteCached: ERROR: " + err);
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
        }*/
    //});

    //app.post(pre + '/fop', function (req, res) {
    //    fop.fop(req, res);

    /*req.accepts('*');
        var routeParams = req.route.params;
        var id = routeParams.id;
        var body = req.body || {};
        var data = JSON.parse(body.data) || {};
        console.log(data);
        if (data.op) {
            switch (data.op) {
            case "add":
                if(data.dir == "*root*"){
                    data.dir = pfs.systemUsr;
                }
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
            case "flist":
                if (pfs.dirObject && data.id) {
                    var temp = {};
                    //temp[data.id] = pfs.dirObject[data.id];
                    for (i in pfs.dirObject[data.id].content) {
                        var id = pfs.dirObject[data.id].content[i];
                        if (pfs.dirObject[id].type == 2) {
                            temp[id] = pfs.dirObject[id];
                        }
                    }
                    res.json({
                        "success": true,
                        "flist": temp
                    });
                } else {
                    res.json({
                        "success": false,
                        "error": "DirObject not defined!"
                    });
                }
                break;
            case "getfilebyname":
                if (pfs.dirObject && data.name) {
                    var aid = "";
                    var dir = data.dir;
                    if(dir == "*root*"){
                        dir = pfs.systemUsr;
                    }
                    for (i in pfs.dirObject[dir].content) {
                        var id = pfs.dirObject[dir].content[i];
                        if (pfs.dirObject[id].name == data.name) {
                            aid = id;
                            break;
                        }
                    }
                    if (aid != "") {
                        res.json({
                            "success": true,
                            "id": aid
                        });
                    } else {
                        res.json({
                            "success": false,
                            "error": "Not found in root dir!"
                        });
                    }
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
        }*/
    //});

    /*app.post(pre + '/add', function (req, res) {
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
    });*/

    /*app.get('/Filesp', function (req, res) {
        req.accepts('*');*/
    /*db.addFile("SUPIFOLDER",2).then(function(data){
            console.log("MY NEW ID: "+data);
            db.getFilesInfoWithoutBuffer();
        }, function(err){
            console.log('error lol');
            console.log(err);
        });*/
    /*db.copyFile('542822426127f3c2522ed24f', "neutest").then(function (data) {
            console.log(data);
            res.json({
                "dat": data
            });
        }, function (err) {
            console.error(err);
            res.json({
                "err": err
            });
        });*/


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
        });
    });*/

    return app;
}