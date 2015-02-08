var rightSystem = require('./rightSystem.js');
var pathconfig = require('./pathconfig.js');
var fs = require('fs-extra');

var m = module.exports = {};

m.moveFiles = function (files, done) {
    rightSystem.moveFiles(files, function (err) {
        if (err) {
            done(err);
        } else {
            var k = 0;
            var e = [];
            for (var i in files) {
                k++;
                var file = files[i];

                if (file.src[file.src.length - 1] == '/') {
                    file.src = file.src.substr(0, file.src.length - 1);
                }

                if (file.dest[file.dest.length - 1] == '/') {
                    file.dest = file.dest.substr(0, file.dest.length - 1);
                }
                fs.move(pathconfig.filesDir + file.src, pathconfig.filesDir + file.dest, function (err) {
                    k--;
                    if (err) {
                        e.push(err);
                    }
                    if (k < 1) {
                        if (e.length > 0) {
                            done(e);
                        } else {
                            done();
                        }
                    }
                });
            }
            if (k < 1) {
                if (e.length > 0) {
                    done(e);
                } else {
                    done();
                }
            }
        }
    });
};

m.copyFiles = function (files, done) {
    var k = 0;
    var e = [];
    for (var i in files) {
        k++;
        var file = files[i];
        if (file.src[file.src.length - 1] == '/') {
            file.src = file.src.substr(0, file.src.length - 1);
        }

        if (file.dest[file.dest.length - 1] == '/') {
            file.dest = file.dest.substr(0, file.dest.length - 1);
        }
        if (file.src == file.dest) {
            var a = file.dest.split('/');
            a[a.length - 1] = '(copy) ' + a[a.length - 1];
            file.dest = a.join('/');
        }
        //console.log('copy', pathconfig.filesDir + file.src, pathconfig.filesDir + file.dest);
        fs.copy(pathconfig.filesDir + file.src, pathconfig.filesDir + file.dest, function (err) {
            k--;
            if (err) {
                e.push(err);
            }
            if (k < 1) {
                if (e.length > 0) {
                    done(e);
                } else {
                    done();
                }
            }
        });
    }
    if (k < 1) {
        if (e.length > 0) {
            done(e);
        } else {
            done();
        }
    }
};

m.removeFiles = function (files, done) {
    rightSystem.removeFiles(files, function (err) {
        if (err) {
            done(err);
        } else {
            var k = 0;
            var e = [];
            for (var i in files) {
                k++;
                var file = files[i];
                fs.remove(pathconfig.filesDir + file, function (err) {
                    k--;
                    if (err) {
                        e.push(err);
                    }
                    if (k < 1) {
                        if (e.length > 0) {
                            done(e);
                        } else {
                            done();
                        }
                    }
                });
            }
            if (k < 1) {
                if (e.length > 0) {
                    done(e);
                } else {
                    done();
                }
            }
        }
    });
};

m.createDir = function (dir, done) {
    if (dir.search(/\./) < 0) {
        fs.ensureDir(pathconfig.filesDir + dir, function (err) {
            done(err);
        });
    } else {
        done('No points in dirnames allowed!');
    }
};

m.readDir = function (dir, done) {
    fs.readdir(pathconfig.filesDir + dir, function (err, files) {
        var out = [];
        if (files && files.length > 0) {
            for (var i in files) {
                if (files[i][0] != '.') {
                    out.push(files[i]);
                }
            }
        }
        done(err, out);
    });
};

m.readDirSure = function (dir, done) {
    fs.ensureDir(pathconfig.filesDir + dir, function (err) {
        if (err) return done(err);
        fs.readdir(pathconfig.filesDir + dir, function (err, files) {
            var out = [];
            if (files && files.length > 0) {
                for (var i in files) {
                    if (files[i][0] != '.') {
                        out.push(files[i]);
                    }
                }
            }
            done(err, out);
        });
    });
};

m.rename = function (oldPath, newPath, done) {
    fs.rename(pathconfig.filesDir + oldPath, pathconfig.filesDir + newPath, function (err) {
        if (err) {
            done(err);
        } else {
            rightSystem.rename(oldPath, newPath, function (err) {
                done(err);
            });
        }
    });
};

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

        fs.writeFile('message.txt', buffer, function (err) {
            if (err) throw err;
            //console.log('It\'s saved!');
        });
    } catch (err) {
        console.error(err);
        res.writeHead(500);
        res.json("May DataURL corrupt!");
    }
};

m.uploadFile = function (destination, dataUrl, user, done) {
    try { //data:image/jpeg;base64,
        var dataString = dataUrl.split(",");
        var data = dataString[0].split(":")[1];
        var infos = data.split(";");
        var contentType = infos[0];
        var encoding = infos[1];

        var buffer = new Buffer(dataString[1], encoding);

        /*if (dir[dir.length - 1] != '/') {
            dir += '/';
        }
        var splittedFileName = filename.split('.');
        var extension = splittedFileName.pop().toLowerCase();
        var name = splittedFileName.join('.');

        filename = pathconfig.changeFileName(name) + '.' + extension;*/

        fs.writeFile(pathconfig.filesDir + destination, buffer, function (err) {
            if (err) return done(err);
            rightSystem.setFileRights(destination, user, function (err) {
                if (err) {
                    done(err);
                } else {
                    done();
                }
            });
            done();
        });
    } catch (err) {
        done(err);
    }
};