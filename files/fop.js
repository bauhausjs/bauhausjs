var db = require('./databaseOperations.js');
var pfs = require('./pragmFileSystem.js');
var File = require('./model/file');
var q = require('q');

var m = module.exports = {};

var getGCD = function (nominator, denominator) {
    'use strict';
    return ((nominator > 0) ? getGCD(denominator % nominator, nominator) : denominator);
}

m.upload = function (req, res) {
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
            db.deleteCached(id).then(function (data) {
                //console.log("deleteCached: " + data);
                res.json({
                    "info": "Upload successful!",
                    "id": data
                });
            }, function (err) {
                console.error("deleteCached: ERROR: " + err);
                res.json({
                    "info": "Upload successful!",
                    "id": data
                });
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
};

m.getFileByName = function (name, dir) {
    if (pfs.dirObject && name) {
        var aid = "";
        if (dir == "*root*") {
            dir = pfs.systemUsr;
        }
        for (i in pfs.dirObject[dir].content) {
            var id = pfs.dirObject[dir].content[i];
            if (pfs.dirObject[id].name.substr(0,24) == name.substr(0,24)) {
                aid = id;
                break;
            }
        }
        if (aid != "") {
            return aid;
        } else {
            return false;
        }
    } else {
        return false;
    }
};

m.fop = function (req, res, ndo) {
    req.accepts('*');
    var routeParams = req.route.params;
    var id = routeParams.id;
    var body = req.body || {};
    var data = JSON.parse(body.data) || {};
    //console.log(data);
    if (data.op) {
        switch (data.op) {
        case "add":
            if (data.dir == "*root*") {
                data.dir = pfs.systemUsr;
            }
            pfs.addFile(data.name, data.dir, data.type).then(function (data) {
                if (ndo) {
                    res.json({
                        "success": true,
                        "data": data
                    });
                } else {
                    res.json({
                        "success": true,
                        "data": data,
                        "dirObject": pfs.dirObject
                    });
                }
            }, function (err) {
                res.json({
                    "success": false,
                    "error": err
                });
            });
            break;
        case "changename":
            pfs.changeName(data.id, data.name).then(function (data) {
                if (ndo) {
                    res.json({
                        "success": true,
                        "data": data
                    });
                } else {
                    res.json({
                        "success": true,
                        "data": data,
                        "dirObject": pfs.dirObject
                    });
                }
            }, function (err) {
                res.json({
                    "success": false,
                    "error": err
                });
            });
            break;
        case "changenameinfolder":
            if (pfs.dirObject[data.id].parent == data.fromid) {
                pfs.changeName(data.id, data.name).then(function (data) {
                    if (ndo) {
                        res.json({
                            "success": true,
                            "data": data
                        });
                    } else {
                        res.json({
                            "success": true,
                            "data": data,
                            "dirObject": pfs.dirObject
                        });
                    }
                }, function (err) {
                    res.json({
                        "success": false,
                        "error": err
                    });
                });
            } else {
                res.json({
                    "success": false,
                    "error": "Forbidden"
                });
            }
            break;
        case "copy":
            pfs.copyFileList(data.copyobject).then(function (data) {
                if (ndo) {
                    res.json({
                        "success": true,
                        "data": data
                    });
                } else {
                    res.json({
                        "success": true,
                        "data": data,
                        "dirObject": pfs.dirObject
                    });
                }
            }, function (err) {
                res.json({
                    "success": false,
                    "error": err
                });
            });
            break;
        case "move":
            pfs.moveFileList(data.moveobject).then(function (data) {
                if (ndo) {
                    res.json({
                        "success": true,
                        "data": data
                    });
                } else {
                    res.json({
                        "success": true,
                        "data": data,
                        "dirObject": pfs.dirObject
                    });
                }
            }, function (err) {
                res.json({
                    "success": false,
                    "error": err
                });
            });
            break;
        case "delete":
            pfs.deleteList(data.deleteobject).then(function (data) {
                if (ndo) {
                    res.json({
                        "success": true,
                        "data": data
                    });
                } else {
                    res.json({
                        "success": true,
                        "data": data,
                        "dirObject": pfs.dirObject
                    });
                }
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
                    if (pfs.dirObject[id]) {
                        if (pfs.dirObject[id].type == 2 && ((pfs.dirObject[id].metadata && pfs.dirObject[id].metadata["content-type"] && pfs.dirObject[id].metadata["content-type"].split('/')[0] == "image") || !pfs.dirObject[id].metadata)) {
                            temp[id] = pfs.dirObject[id];
                        }
                    } else {
                        console.error("ID " + id + " not in dirObject!");
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
                var ret = m.getFileByName(data.name, data.dir);
                if (ret) {
                    res.json({
                        "success": true,
                        "id": ret
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
    }
};