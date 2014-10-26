/******************************************************************************************
#
#       Copyright 2014 Dustin Robert Hoffner
#
#       Licensed under the Apache License, Version 2.0 (the "License");
#       you may not use this file except in compliance with the License.
#       You may obtain a copy of the License at
#
#         http://www.apache.org/licenses/LICENSE-2.0
#
#       Unless required by applicable law or agreed to in writing, software
#       distributed under the License is distributed on an "AS IS" BASIS,
#       WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#       See the License for the specific language governing permissions and
#       limitations under the License.
#       
#       Projectname...................: pragm
#
#       Developer/Date................: Dustin Robert Hoffner, 16.01.2014
#       Filename......................: pragmFileSystem.js
#       Version/Release...............: 0.5xx
#
******************************************************************************************/

var db = require('./databaseOperations.js');
var q = require('q');
var m = module.exports = {};

m.dirObject = null;
m.dir = "./data/";
m.deleteDir = "4DELETED00";
m.guestUser = "5GUESTUSER";
m.systemUsr = "5SYSTEMUSR";
m.userDir = "4ROOTFOLDR";
m.deadObj = "4DEADOBJEC";
m.shareNobo = "4SHARENOBO";
m.dirFile = "DirIndexFile";
m.changedFiles = {};

m.checkFileSystem = function (fobj) {
    fileSystemControl.checkFileSystem(fobj);
};

m.addFile = function (name, dir, type) {
    var deferred = q.defer();
    if (m.dirObject[dir]) {
        if (type == "p") {
            type = 2;
        }
        if (type == "f") {
            type = 1;
        }
        db.addFile(name, type).then(function (id) {
                var id = id;
                if (type == 1) {
                    //console.log("Eins");
                    m.dirObject[id] = {};
                    m.dirObject[id]._id = id;
                    m.dirObject[id].parent = dir;
                    m.dirObject[id].name = name;
                    m.dirObject[id].type = type;
                    m.dirObject[id].content = [];
                    m.dirObject[id].lastmod = new Date().getTime();
                    m.addLink(dir, id);
                }
                if (type == 2) {
                    //console.log("Zwei");
                    m.dirObject[id] = {};
                    m.dirObject[id]._id = id;
                    m.dirObject[id].parent = dir;
                    m.dirObject[id].name = name;
                    m.dirObject[id].type = type;
                    m.dirObject[id].lastmod = new Date().getTime();
                    m.addLink(dir, id);
                }
                //console.log("DATA: " + dir + " " + id);
                m.changedFiles[dir] = true;
                m.changedFiles[id] = true;
                m.saveAll().then(function (data) {
                    deferred.resolve(id);
                    //console.log("Saved");
                }, function (err) {
                    deferred.reject(err);
                });
            },
            function (err) {
                console.log('ERROR: While Adding File: ' + err);
                deferred.reject(err);
            });
    } else {
        deferred.reject("ERROR: Folder does not exists!");
    }
    return deferred.promise;
};

m.changeName = function (id, name) {
    var deferred = q.defer();
    if (m.dirObject[id]) {
        m.dirObject[id].name = name;
        m.changedFiles[id] = true;
        m.saveAll().then(function (data) {
            deferred.resolve(true);
        }, function (err) {
            deferred.reject(err);
        });
    } else {
        deferred.reject("ID not found!");
    }
    return deferred.promise;
};

m.deleteList = function (deleteobject) {
    var deferred = q.defer();
    var c = 0;
    var n = 0;
    var l = deleteobject.deletelist.length;
    var checkEnd = function (a, b, c, d) {
        if (a + b == c) {
            if (b > 0) {
                d.reject("Something went wrong!");
            } else {
                m.saveAll().then(function (data) {
                    d.resolve(true);
                }, function (err) {
                    d.reject(err);
                });
            }
        }
    }

    for (var i in deleteobject.deletelist) {
        var id = deleteobject.deletelist[i];
        if (m.dirObject[id] && m.dirObject[id].parent && m.dirObject[m.dirObject[id].parent] && deleteobject.fromid == m.dirObject[id].parent) {
            m.removeLink(m.dirObject[id].parent, id);
            m.changedFiles[m.dirObject[id].parent] = true;
            if (m.dirObject[id].type == 2) {
                m.deleteFile(id).then(function (data) {
                    c++;
                    checkEnd(c, n, l, deferred);
                }, function (err) {
                    n++;
                    checkEnd(c, n, l, deferred);
                });
            }
            if (m.dirObject[id].type == 1) {
                m.deleteFolder(id, 0).then(function (data) {
                    c++;
                    checkEnd(c, n, l, deferred);
                }, function (err) {
                    n++;
                    checkEnd(c, n, l, deferred);
                });
            }
        }
    }
    return deferred.promise;
};

m.deleteFile = function (id) {
    var deferred = q.defer();
    db.deleteFile(id).then(function (data) {
        db.deleteCached(id).then(function (data) {
            deferred.resolve(data);
        }, function (err) {
            deferred.reject(err);
        });
    }, function (err) {
        deferred.resolve(err);
    });
    return deferred.promise;
};

m.deleteFolder = function (id, deep) {
    var deferred = q.defer();
    deep++;
    if (deep > 990) {
        deferred.reject(" W A R N I N G  delete abort => looped to long! ID: " + id);
    } else {
        var c = 0;
        var n = 0;
        var l = m.dirObject[id].content.length;
        var checkEnd = function (a, b, c, d) {
            if (a + b == c) {
                if (b > 0) {
                    d.reject("Something went wrong!");
                } else {
                    db.deleteFile(id).then(function (data) {
                        d.resolve(true);
                    }, function (err) {
                        d.reject(err);
                    });
                }
            }
        }
        for (var i in m.dirObject[id].content) {
            var did = m.dirObject[id].content[i];
            if (m.dirObject[did].type == 2) {
                m.deleteFile(did).then(function (data) {
                    c++;
                    checkEnd(c, n, l, deferred);
                }, function (err) {
                    n++;
                    checkEnd(c, n, l, deferred);
                });
            }
            if (m.dirObject[did].type == 1) {
                m.deleteFolder(did, deep).then(function (data) {
                    c++;
                    checkEnd(c, n, l, deferred);
                }, function (err) {
                    n++;
                    checkEnd(c, n, l, deferred);
                });
            }
        }
    }
    return deferred.promise;
};

m.moveFileList = function (moveObject) {
    var deferred = q.defer();
    var k = 0;
    for (i in moveObject.files) {
        if (!m.moveFilePosible(moveObject.files[i], moveObject.toid, moveObject.fromid)) {
            k++;
        }
    }
    if (k == 0) {
        for (i in moveObject.files) {
            //var c1 = m.dirObject[moveObject.toid] && m.dirObject[moveObject.toid].type == 1;
            //var c2 = m.dirObject[moveObject.fromid] && m.dirObject[moveObject.fromid].type == 1;
            if (true) {
                m.moveFile(moveObject.files[i], moveObject.toid, moveObject.fromid);
                //console.log("Content of ID: "+moveObject.toid+" CON: "+JSON.stringify(m.dirObject[moveObject.toid].content));
                //console.log("Content of ID: "+moveObject.fromid+" CON: "+JSON.stringify(m.dirObject[moveObject.fromid].content));
            }
        }
        m.saveAll().then(function (data) {
            deferred.resolve(true);
        }, function (err) {
            deferred.reject(err);
        });
    } else {
        deferred.reject("You cannot move a folder into itself!");
    }
    return deferred.promise;
};

m.moveFile = function (id, toid, fromid) {
    console.log("ID: " + id + " TOID: " + toid + " FROMID: " + fromid);
    var s = m.isSubOrdered(toid, id);
    if (m.dirObject[id].parent == fromid && !s) {
        console.log("GO");
        m.removeLink(fromid, id);
        m.dirObject[id].parent = toid;
        m.addLink(toid, id);
        m.changedFiles[id] = true;
        m.changedFiles[toid] = true;
        m.changedFiles[fromid] = true;
    }
};

m.getObjectSize = function (obj) {
    var k = 0;
    for (i in obj) {
        k++;
    }
    return k;
};

m.moveFilePosible = function (id, toid, fromid) {
    if (!m.isSubOrdered(toid, id)) {
        return true;
    } else {
        return false;
    }
};



m.copyFileList = function (copyObject) {
    var deferred = q.defer();
    var x = copyObject.files.length;
    var y = 0;
    var z = 0;

    for (i in copyObject.files) {
        var cid = copyObject.files[i];
        switch (m.dirObject[cid].type) {
        case 1:
            m.copyFolder(cid, copyObject.toid, 0).then(function (data) {
                y++;
                if (y + z == x) {
                    m.saveAll().then(function (data) {
                        if (z > 0) {
                            deferred.reject(err);
                        } else {
                            deferred.resolve(data);
                        }
                    }, function (err) {
                        deferred.reject(err);
                    });
                }
            }, function (err) {
                z++;
                if (y + z === x) {
                    deferred.reject(err);
                }
            });
            break;
        case 2:
            m.copyFile(cid, copyObject.toid).then(function (data) {
                y++;
                if (y + z == x) {
                    m.saveAll().then(function (data) {
                        if (z > 0) {
                            deferred.reject(err);
                        } else {
                            deferred.resolve(data);
                        }
                    }, function (err) {
                        deferred.reject(err);
                    });
                }
                deferred.resolve(data);
            }, function (err) {
                z++;
                if (y + z == x) {
                    deferred.reject(err);
                }
            });
            break;
        default:
            deferred.reject("Invalid type!");
            break;
        }

    }
    return deferred.promise;
};

m.copyFile = function (id, toid) {
    //console.log("COPY File: ID: " + id + " TOID: " + toid);
    var deferred = q.defer();
    if (m.dirObject[id].parent == toid) {
        var name = m.dirObject[id].name + ' (copy)';
    } else {
        var name = m.dirObject[id].name;
    }
    db.copyFile(id, name).then(function (nid) {
        m.dirObject[nid] = {};
        m.dirObject[nid]._id = nid;
        m.dirObject[nid].parent = toid;
        m.dirObject[nid].name = name;
        m.dirObject[nid].type = 2;
        m.dirObject[nid].lastmod = new Date().getTime();
        m.addLink(toid, nid);
        m.changedFiles[nid] = true;
        m.changedFiles[toid] = true;
        console.log("Finish copy of " + name);
        deferred.resolve(nid);
    }, function (err) {
        deferred.reject(err);
    });
    return deferred.promise;
};

m.copyFolder = function (id, toid, deep) { // ==== RECURSIVE ==== !!!!!!!!!!!!!!!!!!!!!
    //console.log("COPY: ID: " + id + " TOID: " + toid+ " DEEP: " + deep);
    var deferred = q.defer();
    deep++;
    if (deep > 990 || m.isSubOrdered(toid, id)) {
        if (deep > 990) {
            console.log(" W A R N I N G  copy abort => looped to long! ID: " + id + " TOID: " + toid);
            deferred.reject("You cannot make more than 990 subfolders!");
        } else {
            console.log("You cannot copy a file into itself! ID: " + id + " TOID: " + toid);
            deferred.reject("You cannot copy a file into itself!");
        }
    } else {
        if (m.dirObject[id].parent == toid) {
            var name = m.dirObject[id].name + ' (copy)';
        } else {
            var name = m.dirObject[id].name;
        }

        db.copyFile(id, name).then(function (nid) {
            m.dirObject[nid] = {};
            m.dirObject[nid]._id = id;
            m.dirObject[nid].parent = toid;
            m.dirObject[nid].name = name;
            m.dirObject[nid].type = 1;
            m.dirObject[nid].content = [];
            m.dirObject[nid].lastmod = new Date().getTime();
            m.addLink(toid, nid);

            m.changedFiles[nid] = true;
            m.changedFiles[toid] = true;
            console.log("Finish copy of " + name);
            var c = m.dirObject[id].content.length;
            var n = 0;
            var g = 0;

            for (i in m.dirObject[id].content) {
                var cid = m.dirObject[id].content[i];
                if (m.dirObject[cid].type == 0 || m.dirObject[cid].type == 1) {
                    m.copyFolder(cid, nid, deep).then(function (data) {
                        g++;
                        if (g + n == c) {
                            if (n > 0) {
                                deferred.reject("Something went wrong while copying files!");
                            } else {
                                console.log("STOP!!!!");
                                deferred.resolve(data);
                            }
                        }
                    }, function (err) {
                        n++;
                        if (g + n === c) {
                            deferred.reject("Something went wrong while copying files!");
                        }
                    });
                }
                if (m.dirObject[cid].type == 2) {
                    m.copyFile(cid, nid).then(function (data) {
                        g++;
                        if (g + n == c) {
                            if (n > 0) {
                                deferred.reject("Something went wrong while copying files!");
                            } else {
                                console.log("STOP!!!!");
                                deferred.resolve(data);
                            }
                        }
                    }, function (err) {
                        n++;
                        if (g + n == c) {
                            deferred.reject("Something went wrong while copying files!");
                        }
                        deferred.reject(err);
                    });
                }
            }
            if (c === 0) {
                console.log("STOP!!!!");
                deferred.resolve(true);
            }
        }, function (err) {
            deferred.reject(err);
        });
    }

    return deferred.promise;
};

m.addLink = function (id, linkID) {
    //console.log("ADDLINK: ID: "+id+" LINKID: "+linkID);
    linkID = linkID.toString();
    if (m.dirObject[id] && m.dirObject[linkID]) {
        var key = m.dirObject[id].content.indexOf(linkID);
        if (key == -1) {
            m.dirObject[id].content.push(linkID);
        }
        //console.log(" => Content of KEY: "+key+" ID: "+id+" CON: "+JSON.stringify(m.dirObject[id].content));
    } else {
        //console.log("ID '" + id + "' or '" + linkID + "' does not exist in dirObject! [pragmfileSystemJson:addLink]");
    }
};

m.removeLink = function (id, linkID) {
    //console.log("REMOVELINK: ID: "+id+" LINKID: "+linkID);
    linkID = linkID.toString();
    if (m.dirObject[id] && m.dirObject[linkID]) {
        var key = m.dirObject[id].content.indexOf(linkID);
        m.dirObject[id].content.splice(key, 1);
        //console.log(" => Content of KEY: "+key+" ID: "+id+" CON: "+JSON.stringify(m.dirObject[id].content));
    } else {
        //console.log("ID '" + id + "' or '" + linkID + "' does not exist in dirObject! [pragmfileSystemJson:removeLink]");
    }
};

m.isSubOrdered = function (superID, subID) {
    var id = superID;
    var i = 0;
    var idarr = [];
    idarr.push(id);
    if (m.dirObject[id] && m.dirObject[id].parent) {
        id = m.dirObject[id].parent;
        idarr.push(id);
        while (id != m.systemUsr && i < 992 && m.dirObject[id] && m.dirObject[id].parent) {
            i++;
            id = m.dirObject[id].parent;
            idarr.push(id);
        }
    }
    if (idarr.indexOf(subID) != -1) {
        return true;
    }
    if (i > 990) {
        console.log(" W A R N I N G  fileSystemJson.js looped to long!");
        return true;
    }
    return false;
};

m.unescape = function (str) {
    while (str[0] == " ") {
        str = str.substr(1);
        //dlog("Unescape1");
    }
    while (str[str.length - 1] == " ") {
        str = str.substr(0, str.length - 1);
        //dlog("Unescape2");
    }
    return str;
};

m.joinArrays = function (l1, l2) {
    for (i in l1) {
        if (l2.indexOf(l1[i]) == -1) {
            l2.push(l1[i]);
        }
    }
    return l2;
}

m.checkLinkExists = function (o, n, id) {
    var out = {};
    var l = [];
    for (i in n) {
        if (!(i in o)) {
            l.push(i);
        }
    }
    var found = false;
    for (i in l) {
        found = false;
        for (k in m.dirObject) {
            if (m.dirObject[k].owner == l[i] && 'content' in m.dirObject[k] && m.dirObject[k].content.indexOf(id) != -1) {
                found = true;
                break;
            }
        }
        if (!found) {
            out[l[i]] = true;
            //m.addLink(l[i], id);
        }
    }
    return out;
};

m.init = function () {
    //setInterval(m.checkToSave, m.intervalTime);
    var deferred = q.defer();
    if (m.dirObject == null) {
        db.getFilesInfoWithoutBuffer().then(function (data) {
            m.dirObject = data;
            console.log(data);
            deferred.resolve(true);
        }, function (err) {
            console.error("ERROR: Cannot load dirObject pragm file system! " + err);
            deferred.reject(err);
        });
    } else {
        deferred.resolve(true);
    }
    return deferred.promise;
};

m.searchMainDir = function () {
    for (i in m.dirObject) {
        if (m.dirObject[i].type === 0) {
            m.systemUsr = i;
            return true;
        }
    }
    return false;
};

m.saveAll = function () {
    var deferred = q.defer();
    var c = 0;
    var n = 0;
    var g = 0;
    for (i in m.changedFiles) {
        c++;
        console.log("Save " + i);
        db.setFileInfo(i, m.dirObject[i]).then(function (data) {
            console.log("Saved " + i);
            n++;
            g++;
            if (n == c) {
                //console.log("Saved " + g + " from " + n + " files successfully to MongoDB!");
                if (g == n) {
                    deferred.resolve("Saved " + g + " from " + n + " files successfully to MongoDB!");
                } else {
                    deferred.reject("Saved " + g + " from " + n + " files successfully to MongoDB!");
                }
            }
        }, function (err) {
            n++;
            console.log("Saving file failed! " + err);
            if (n == c) {
                //console.log("Saved " + g + " from " + n + " files successfully to MongoDB!");
                if (g == n) {
                    deferred.resolve("Saved " + g + " from " + n + " files successfully to MongoDB!");
                } else {
                    deferred.reject("Saved " + g + " from " + n + " files successfully to MongoDB!");
                }
            }
        });
    }
    if (c == 0) {
        deferred.resolve("No files to save!");
    }
    m.changedFiles = null;
    m.changedFiles = {};
    return deferred.promise;
};

console.log("Loading FileSystem Index into Cache...");
m.init().then(function (data) {
    console.log("Loading FileSystem Index into Cache Finished!");
    var temp = m.searchMainDir();
    //for(i in m.dirObject){
    //    m.dirObject[i].name += " LOL";
    //    m.changedFiles[i] = true;
    //}
    if (!temp) {
        console.log("Create New root Dir!");
        var file = {};
        file.name = "root";
        file.type = 0;
        file.content = [];
        db.addFileObject(file).then(function (data) {
            console.log("New root Dir: " + data);
            m.dirObject = null;
            m.init().then(function (data) {
                console.log("Loading FileSystem Index into Cache Finished!");
                console.log(m.dirObject);
                var temp = m.searchMainDir();
                if (!temp) {
                    console.log("ERROR: Found no Main Dir!" + err);
                }
            }, function (err) {
                console.log("ERROR: Failed to load Dir!" + err);
            });
        }, function (err) {
            console.log("ERROR: Failed to create new Main Dir!" + err);
        });
    }
}, function (err) {
    console.log("Loading FileSystem Index into Cache ERROR: " + err);
});


//var pfile = new pfile_typ();

//module.exports = pfile_typ;

//m.readStr('123', 'dir', 2);
//var tea = { };
//tea['1002343355'] = "0392041400TEST IST DAS GEIL";
//tea['1031111111'] = "Dies ist eine Ueberschrift";
//tea['1009999409'] = "0133128400Dies ist keine Ueberschrift";
//m.writeStr('3emqfb6uw2', 'file', 12);