var FileRight = require('./model/fileright');

var m = module.exports = {};
var cacheFree = 100;
var cache = {};
/*cache['/test.jpg'] = {
    right: {
        'visible': true
    },
    lastused: Date.now()
};*/

m.getPathRights = function (path, done) {
    path = m.unifyPath(path);
    if (cache[path]) {
        console.log('load cached');
        cache[path].lastused = Date.now();
        done(cache[path].right);
    } else {
        console.log('load DB');
        loadPathRights(path, function () {
            done(cache[path].right);
        });
    }
};

var loadPathRights = function (path, done) {
    getDBPathRights(path, function (cacheEntry) {
        if (cacheFree <= 0) {
            var min = Infinity;
            var index = "";
            for (var i in cache) {
                if (cache[i].lastused < min) {
                    min = cache[i].lastused;
                    index = i;
                }
            }
            delete cache[index];
        } else {
            cacheFree--;
        }
        cache[path] = cacheEntry;
        done();
    });
};

var getDBPathRights = function (path, done) {
    FileRight.findOne({
        path: path
    }, function (err, right) {
        if (err) {
            done({
                right: {
                    'user': false,
                    'err': err
                },
                lastused: Date.now()
            });
        } else {
            if (!right) {
                done({
                    right: {
                        'user': false,
                        'no': 'rights'
                    },
                    lastused: Date.now()
                });
            } else {
                done({
                    right: right,
                    lastused: Date.now()
                });
            }
        }
    });
};

m.unifyPath = function (path) {
    var a = path.split('/'); // a is the splitted path like a/b/c/d => ['a','b','c','d']
    if (a[a.length - 1].search(/\./) < 0) {
        if (path[path.length - 1] != "/") {
            path += '/';
        }
    } else {
        var b = a[a.length - 1].split('.');
        if (b.length > 1) {
            b[b.length - 1] = b[b.length - 1].toLowerCase();
        }
        a[a.length - 1] = b.join('.');
        path = a.join('/');
    }
    return path;
};

m.setFileRights = function (path, user, done) {
    path = m.unifyPath(path);
    FileRight.findOne({
        path: path
    }, function (err, fileright) {
        if (err) {
            done(err);
        } else {
            if (!fileright) {
                var fileright = new FileRight({
                    path: path,
                    user: user
                });
            } else {
                fileright.user = user;
            }
            if (cache[path]) {
                cache[path].right = fileright;
                cache[path].lastused = Date.now();
            }
            fileright.save(function (err, fileright) {
                if (err) {
                    console.error('err', err);
                    done(err);
                } else {
                    //console.log('fileright', fileright);
                    done();
                }
            });
        }
    });
};

var RegExpEscape = function (s) {
    return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}

m.getAllSubFiles = function (path, done) {
    path = m.unifyPath(path);
    var regpath = RegExpEscape(path);
    FileRight.find({
        path: new RegExp(regpath + '(.)*')
    }, function (err, doc) {
        if (err) {
            done(err);
        } else {
            done(false, doc);
        }
    });
};

m.removeAllSubFiles = function (path, done) {
    path = m.unifyPath(path);
    var regpath = RegExpEscape(path);
    FileRight.find({
        path: new RegExp(regpath + '(.)*')
    }, function (err, files) {
        if (err) {
            done(err);
        } else {
            for (var j in files) {
                if (cache[files[j].path]) {
                    delete cache[files[j].path];
                    cacheFree++;
                }
            }
            FileRight.find().remove({
                path: new RegExp(regpath + '(.)*')
            }, function (err, files) {
                done(err);
            });
        }
    });
};

m.removeFiles = function (files, done) {
    var k = 0;
    var e = [];
    for (var i in files) {
        k++;
        var file = files[i];
        m.removeAllSubFiles(file, function (err) {
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

m.moveFiles = function (files, done) {
    var k = 0;
    var e = [];
    for (var i in files) {
        k++;
        var file = files[i];
        //console.log('moveFiles', file);
        m.rename(file.src, file.dest, function (err) {
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

m.rename = function (oldPath, newPath, done) {
    oldPath = m.unifyPath(oldPath);
    newPath = m.unifyPath(newPath);
    var regpath = RegExpEscape(oldPath);
    FileRight.find({
        path: new RegExp(regpath + '(.)*')
    }, function (err, files) {
        if (err) {
            done(err);
        } else {
            var ol = oldPath.length;
            var k = 0;
            var e = [];

            for (var i in files) {
                k++;
                delete cache[files[i].path];
                cacheFree++;
                files[i].path = newPath + files[i].path.substr(ol);
                files[i].save(function (err, fileright) {
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

/*m.removeFiles(['/fold/', '/test.jpg'], function (err) {
    console.log('fileerrors', err);
});*/


/*var fileright = new FileRight({
    path: '/test.jpg',
    visible: true
});

fileright.save(function (err, fileright) {
    if (err) {
        console.error('err', err);
    } else {
        console.log('fileright', fileright);
    }
});*/