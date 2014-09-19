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

var dbop = require('./databaseOperations.js');
//var fs = require('fs');
var m = module.exports = {};

m.dirObject = {};
m.dir = "./data/";
m.deleteDir = "4DELETED00";
m.guestUser = "5GUESTUSER";
m.systemUsr = "5SYSTEMUSR";
m.userDir = "4ROOTFOLDR";
m.deadObj = "4DEADOBJEC";
m.shareNobo = "4SHARENOBO";
m.dirFile = "DirIndexFile";
m.size = {
    "3": 1000,
    "4": 300
};

var searchArray = function (array, word) {
    if (array.indexOf(word) != -1) {
        return true;
    }
    return false;
}

m.loadDirObject = function(){
    m.dirObject = dbop.getFilesInfoWithoutBuffer();
};

m.checkFileSystem = function (fobj) {
    fileSystemControl.checkFileSystem(fobj);
};

m.readStr = function (id, operation, clientID) {
    if (operation == 'dir') {
        id = m.dirFile;
    }
    var file = global.config.dir + id + '.json';
    fs.readFile(file, 'UTF8', function (err, fileData) {
        if (err) {
            console.log('tryed to read file: ' + file);
        } else {
            if (operation == 'dir') {
                //m.dirObject = JSON.parse(fileData);
                m.checkFileSystem(JSON.parse(fileData));
                //console.log(m.dirObject);
                //m.generateUserFilelist(clientID, m.systemUsr);
                //var rid = m.addFile(12, m.systemUsr, "Hans", m.systemUsr, "u");
                //var rid2 = m.addFile(12, rid, "HansOrdner", rid, "f");
                //var rid = m.addFile(12, rid, "HansDatei", rid2, "p");
                //console.log(m.dirObject);
                //console.log(m.deleteFile(12, "5000000001", rid));
                //m.writeStr(m.dirFile, 'dir', 12);
                //console.log(m.dirObject);

            }
            if (operation == 'file') {
                dlog("UPDATE OLD");
                L3.files[id] = JSON.parse(fileData);
                //L3.oldFiles[id] = JSON.parse(fileData);
                L3.updateUser(clientID);
            }
        }
    });
};

m.writeStr = function (id, operation, clientID) {
    if (operation == 'dir') {
        var text = JSON.stringify(m.dirObject);
        id = m.dirFile;
    }
    if (operation == 'file') {
        var text = JSON.stringify(L3.files[id]); // L3.files[id]
        if (text) {
            m.dirObject[id].size = text.length;
        }
        //L3.killData(id);
    }
    if (operation == 'newfile') {
        var tempNew = {};
        tempNew['1031111111'] = clientID;
        tempNew['1031111112'] = date.fileDate();
        var text = JSON.stringify(tempNew); // L3.files[id]
        // Todo: L3.killData(id); (clear RAM)
    }
    if (id != "") {
        fs.writeFile(global.config.dir + id + '.json', text, function (err) {
            if (err) {
                error.report(3, 'tryed to write file: ' + file);
            } else {
                log("Saved file " + m.dir + id + '.json');
                if (operation == 'file') {
                    m.dirObject[id].lastmod = new Date().getTime();
                    m.saveDirObject();
                    //m.writeStr('x', 'dir', 12);
                }
                if (id != m.dirFile) {
                    L3.killData(id);
                }
                if (L3.exit == true && L3.lastkey == id) {
                    cLog("exit websocket server");
                    wsServer.shutDown();
                    server.close();
                }
            }
        });
    }
};

m.copyFileOnDisc = function (fromID, toID) {
    fs.exists(global.config.dir + fromID + '.json', function (exists) {
        if (exists) {
            fs.createReadStream(global.config.dir + fromID + '.json').pipe(fs.createWriteStream(global.config.dir + toID + '.json'));
        }
    });
};

m.deleteFileOnDisc = function (id) {
    fs.exists(global.config.dir + id + '.json', function (exists) {
        if (exists) {
            fs.unlink(global.config.dir + id + '.json', function () {
                log("File " + id + ".json deleted");
            });
        }
    });
}

m.checkLogin = function (clientID, username, password) {
    dlog("LOGIN DATA => clientID '" + clientID + "' username '" + username + "' password '" + password + "'");
    var userID = null;
    var temp = {};
    temp.userRight = global.mNoLogin;
    temp.username = "xxxxxxxxxx";
    temp.userID = "";
    for (key in m.dirObject) {
        if (m.dirObject[key].username == username) {
            userID = key;
            break;
        }
    }
    if (userID != null && userID[0] == "5") {
        if (m.dirObject[userID].active == true && m.dirObject[userID].password == password) {
            temp.userRight = m.dirObject[userID].userRight;
            temp.username = username;
            temp.userID = userID;
            m.dirObject[userID].lastactive = Date.now();
        }
    }
    secure.loginData(clientID, temp); // Todo: When mulible users cause problems copy temp object in another way
};

m.addFile = function (clientID, userID, name, dir, type) {
    if (type == "f") {
        if (m.dirObject[userID].storageScore + m.size["4"] <= m.dirObject[userID].maxStorageScore) {
            var typ = "4";
            var id = m.makeID(typ);
            m.dirObject[id] = {};
            m.dirObject[id].owner = userID;
            m.dirObject[id].parent = dir;
            m.dirObject[id].name = name;
            m.dirObject[id].content = [];
            m.dirObject[id].share = m.generateSubFileShare(dir); // JSON.parse(JSON.stringify(m.dirObject[dir].share))
            /*if (m.dirObject[dir].owner != userID && !(m.dirObject[dir].owner in m.dirObject[dir].share)) {
                    m.dirObject[id].share[m.dirObject[dir].owner].r = 2;
                    m.dirObject[id].share[m.dirObject[dir].owner].a = "y";
                }*/
            m.dirObject[id].lastmod = new Date().getTime();
            m.addLink(dir, id);
        } else {
            L2x1.send(clientID, sID.message, "Adding folder abort! Your storage is full!");
        }
    }
    if (type == "p") {
        if (m.dirObject[userID].storageScore + m.size["3"] <= m.dirObject[userID].maxStorageScore) {
            var typ = "3";
            var id = m.makeID(typ);
            m.dirObject[id] = {};
            m.dirObject[id].owner = userID;
            m.dirObject[id].parent = dir;
            m.dirObject[id].name = name;
            m.dirObject[id].share = m.generateSubFileShare(dir); // JSON.parse(JSON.stringify(m.dirObject[dir].share))
            /*if (m.dirObject[dir].owner != userID && !(m.dirObject[dir].owner in m.dirObject[dir].share)) {
                    m.dirObject[id].share[m.dirObject[dir].owner].r = 2;
                    m.dirObject[id].share[m.dirObject[dir].owner].a = "y";
                }*/
            m.dirObject[id].lastmod = new Date().getTime();
            m.addLink(dir, id);
            m.writeStr(id, 'newfile', name);
        } else {
            L2x1.send(clientID, sID.message, "Adding file abort! Your storage is full!");
        }
    }
    if (type == "u") {
        dir = m.userDir;
        var typ = "5";
        var id = m.makeID(typ);
        m.dirObject[id] = {};
        m.dirObject[id].owner = id;
        m.dirObject[id].parent = dir;
        m.dirObject[id].name = name;
        m.dirObject[id].username = name;
        m.dirObject[id].password = "initial";
        m.dirObject[id].userRight = 3;
        m.dirObject[id].content = [];
        m.dirObject[id].share = {};
        m.addLink(dir, id);
    }
    //return id;
    m.generateUserFilelist(clientID, userID);
    m.saveDirObject();
    //m.writeStr('x', 'dir', 12);
};

m.addUser = function (clientID, y) {
    var userNameUsed = false;
    for (i in m.dirObject) {
        if (i[0] == "5") {
            if (m.dirObject[i].username == y.username) {
                userNameUsed = true;
            }
        }
    }
    if (!userNameUsed) {
        dir = m.userDir;
        var typ = "5";
        var id = m.makeID(typ);
        m.dirObject[id] = {};
        m.dirObject[id].owner = id;
        m.dirObject[id].parent = dir;
        m.dirObject[id].firstname = y.firstname;
        m.dirObject[id].lastname = y.lastname;
        m.dirObject[id].name = y.username;
        m.dirObject[id].username = y.username;
        m.dirObject[id].email = y.email;
        m.dirObject[id].password = y.password;
        m.dirObject[id].active = true;
        m.dirObject[id].userRight = 3;
        m.dirObject[id].content = [];
        m.dirObject[id].share = {};
        m.dirObject[id].notifications = [];
        m.dirObject[id].storageScore = 0;
        m.dirObject[id].maxStorageScore = 200000;
        m.addLink(dir, id);
        inviteKey.setKeyUsed(y.invitekey, id);
        m.saveDirObject();
        //m.writeStr('x', 'dir', 12);
        L2x1.send(clientID, sID.createAccount, JSON.stringify({
            "value": true,
            "userID": id
        }));
    } else {
        L2x1.send(clientID, sID.createAccount, JSON.stringify({
            "value": false,
            "text": "Username already exists!"
        }));
    }
};

m.deleteFile = function (clientID, userID, id) {
    if (userID == m.systemUsr) {
        var first = id.substr(0, 1);
        var copylist = [];
        dlog("end1");
        if (first == '4' || first == '5') {
            copylist = m.copyFolder(copylist, clientID, userID, id, m.deleteDir, 0);
            dlog("end2");
        }
        if (first == '3') {
            copylist = m.copyFile(copylist, clientID, userID, id, m.deleteDir);
            dlog("end3");
        }
        for (i in copylist) {
            dlog("loop1");
            if (copylist[i].job == 'addfolder') {
                var id = copylist[i].oldid;
                //m.dirObject[id] = { };
                //m.dirObject[id].owner = copylist[i].owner;
                //m.dirObject[id].parent = copylist[i].parent;
                //m.dirObject[id].name = copylist[i].name;
                //m.dirObject[id].content = [];
                //m.dirObject[id].share = JSON.parse(JSON.stringify(copylist[i].share));
                //m.dirObject[id].lastmod = copylist[i].lastmod;
                dlog("killfolder");
                m.removeLink(m.dirObject[id].parent, id);
                delete m.dirObject[id];
                //m.deleteFileOnDisc(id);
                dlog("killfolderend");
            }
            if (copylist[i].job == 'addfile') {
                var id = copylist[i].oldid;
                //m.dirObject[id] = { };
                //m.dirObject[id].owner = copylist[i].owner;
                //m.dirObject[id].parent = copylist[i].parent;
                //m.dirObject[id].name = copylist[i].name;
                //m.dirObject[id].share = JSON.parse(JSON.stringify(copylist[i].share));
                //m.dirObject[id].lastmod = copylist[i].lastmod;
                //m.copyFileOnDisc(copylist[i].oldid, id);
                dlog("killfile");
                m.removeLink(m.dirObject[id].parent, id);
                delete m.dirObject[id];
                m.deleteFileOnDisc(id);
                dlog("killfileend");
            }
        }
        dlog("generateUserFilelist");
        m.generateUserFilelist(clientID, userID);
        dlog("generateUserFilelistend");
        m.saveDirObject(false);
        dlog("saved");
    } else {
        dlog("Deleteclient = " + clientID);
        dlog("DeleteuserID = " + userID);
        dlog("Delete    ID = " + id);
        dlog("Delete Owner = " + m.dirObject[id].owner);
        /*if (fRights.isUserAllowedTo(id, userID, 'write')) {
                dlog("Delete TRUE");
                m.removeLink(m.dirObject[id].parent, id);
                m.dirObject[id].parent = m.deleteDir;
                m.addLink(m.deleteDir, id);
                m.saveDirObject(false);
                m.generateUserFilelist(clientID, userID);
            } else {
                L2x1.send(clientID, sID.message, "Deleting file abort! Permission Denied!");
            }
            */
        L2x1.send(clientID, sID.message, "This function has been removed! Please contact an administrator with code #DEdel. You can delete files by moving them to trash!");
    }
};

m.moveFileList = function (clientID, userID, moveObject) {
    var k = 0;
    for (i in moveObject.files) {
        if (!m.moveFilePosible(clientID, userID, moveObject.files[i], moveObject.toid, moveObject.fromid)) {
            k++;
        }
    }
    if (k == 0) {
        // BLOCK DirObject Save
        m.editDirObject = true;

        for (i in moveObject.files) {
            m.moveFileNew(clientID, userID, moveObject.files[i], moveObject.toid, moveObject.fromid);
        }

        // UNBLOCK DirObject Save
        m.editDirObject = false;

        var infolist = m.joinArrays(m.getFileClients(moveObject.toid), m.getFileClients(moveObject.fromid));
        infolist = m.joinArrays(infolist, [clientID]);
        for (key in infolist) {
            if (infolist[key] in L3.users && 'userID' in L3.users[infolist[key]]) {
                m.generateUserFilelist(infolist[key], L3.users[infolist[key]].userID);
            }
        }
        m.saveDirObject(false);
    } else {
        if (k > 1) {
            //L2x1.send(clientID, sID.message, "Moving of "+k+" files abort!");
        }
    }
};

m.moveFile = function (clientID, userID, id, toid, fromid) {
    var w = fRights.isUserAllowedTo(id, userID, 'write');
    var p = m.dirObject[id].parent != fromid;
    var r = fRights.isUserAllowedTo(id, userID, 'read');
    var s = m.isSubOrdered(toid, id);
    var d = userID == m.systemUsr && fromid == toid && toid == m.deleteDir;
    log("D:" + d);

    if ((((w || (p && r))) && !s) || d) {
        m.removeLink(fromid, id);
        if (m.dirObject[id].parent == fromid && !d && toid != m.deleteDir) {
            m.dirObject[id].parent = toid;
            m.addLink(toid, id);
        } else {
            if (toid == m.deleteDir) {
                if (!d) {
                    var k = 0;
                    for (i in m.dirObject[id].share) {
                        k++;
                        break;
                    }
                    log("Sharelenght = " + k);
                    if (k == 0) {
                        m.dirObject[id].parent = m.toid;
                        m.addLink(toid, id);
                    } else {
                        m.dirObject[id].parent = m.shareNobo;
                        m.addLink(m.shareNobo, id);
                    }
                } else {
                    delete m.dirObject[id];
                    if (id[0] == "3") {
                        m.deleteFileOnDisc(id);
                    }
                }
            } else {
                m.addLink(toid, id);
            }
        }
    } else {
        if (!(fRights.isUserAllowedTo(id, userID, 'write') || (m.dirObject[id].parent != fromid && fRights.isUserAllowedTo(id, userID, 'read')))) {
            L2x1.send(clientID, sID.message, "Moving file abort! Permission Denied!");
        } else {
            if (m.isSubOrdered(toid, id)) {
                L2x1.send(clientID, sID.message, "Moving file abort! Destination directory is subordinate to source directory!");
            } else {
                L2x1.send(clientID, sID.message, "Moving file abort! Unknown Error! Please contact your server administrator!");
            }
        }
    }
};

m.getObjectSize = function (obj) {
    var k = 0;
    for (i in obj) {
        k++;
    }
    return k;
};

m.hasFileAdmin = function (obj) {
    var k = 0;
    var id = "";
    for (i in obj) {
        if (obj[i].r == 2) {
            k++;
            id = i;
        }
    }
    return {
        "num": k,
        "id": id
    };
};

m.searchFileLinkFromUserId = function (id, userid) {
    for (i in m.dirObject) {
        if ((i[0] == "4" || i[0] == "5") && (m.dirObject[i].owner == userid || m.dirObject[i].share[userid]) && m.dirObject[i].content.indexOf(id) >= 0) {
            return i;
        }
    }
    return false;
};

m.moveFileNew = function (clientID, userID, id, toid, fromid) {
    var canWrite = fRights.isUserAllowedTo(id, userID, 'write');
    var parentIsFrom = m.dirObject[id].parent == fromid;
    var canRead = fRights.isUserAllowedTo(id, userID, 'read');
    var isSubOrdered = m.isSubOrdered(toid, id);
    var canDelete = userID == m.systemUsr && fromid == toid && toid == m.deleteDir;
    var isToDelete = toid == m.deleteDir;
    var ownFile = m.dirObject[id].owner == userID;

    if (!isSubOrdered) {
        if (isToDelete) {
            if (canDelete) {
                m.removeLink(fromid, id);
                delete m.dirObject[id];
                if (id[0] == "3") {
                    m.deleteFileOnDisc(id);
                }
            } else {
                if (ownFile) {
                    if (m.dirObject[id].share[userID]) {
                        delete m.dirObject[id].share[userID];
                    }
                    if (m.getObjectSize(m.dirObject[id].share) > 0) {
                        var hasFileAdmin = m.hasFileAdmin(m.dirObject[id].share);
                        if (hasFileAdmin.num == 1) {
                            var temp = m.searchFileLinkFromUserId(id, hasFileAdmin.id);
                            if (temp && m.dirObject[id].parent == fromid) {
                                m.dirObject[id].owner = hasFileAdmin.id;
                                m.dirObject[id].parent = temp;
                            } else {
                                log("Delete Error!");
                                log(JSON.stringify(temp));
                                log(JSON.stringify([m.dirObject[id].parent, fromid]));
                                L2x1.send(clientID, sID.message, "Deleting file abort! Internal Error! Cannot find next Admin Link or Parent not From!");
                            }
                        } else {
                            L2x1.send(clientID, sID.message, "Deleting file abort! Please define exact one admin before deleting a shared file/folder!");
                        }
                    } else {
                        m.removeLink(fromid, id);
                        if (m.dirObject[id].parent == fromid) {
                            m.dirObject[id].parent = toid;
                            m.addLink(toid, id);
                        } else {
                            L2x1.send(clientID, sID.message, "ERROR #0001! Please inform your admin!");
                        }
                    }
                } else {
                    if (fRights.isUserAllowedTo(fromid, userID, 'write')) {
                        m.removeLink(fromid, id);
                        delete m.dirObject[id].share[userID];
                        if (m.getObjectSize(m.dirObject[id].share) == 0) {
                            m.addLink(toid, id);
                        }
                    }
                }
            }
        } else {
            if (fRights.isUserAllowedTo(fromid, userID, 'write') && fRights.isUserAllowedTo(toid, userID, 'write')) {
                m.removeLink(fromid, id);
                if (m.dirObject[id].parent == fromid && fRights.isUserAllowedTo(id, userID, 'write')) {
                    m.dirObject[id].parent = toid;
                }
                m.addLink(toid, id);
            }
        }
    }
};

m.moveFilePosible = function (clientID, userID, id, toid, fromid) {
    if (((fRights.isUserAllowedTo(id, userID, 'write') || (m.dirObject[id].parent != fromid && fRights.isUserAllowedTo(id, userID, 'read')))) && !m.isSubOrdered(toid, id)) {
        return true;
    } else {
        if (!(fRights.isUserAllowedTo(id, userID, 'write') || (m.dirObject[id].parent != fromid && fRights.isUserAllowedTo(id, userID, 'read')))) {
            L2x1.send(clientID, sID.message, "Moving file abort! Permission Denied!");
        } else {
            if (m.isSubOrdered(toid, id)) {
                L2x1.send(clientID, sID.message, "Moving file abort! Destination directory is subordinate to source directory!");
            } else {
                L2x1.send(clientID, sID.message, "Moving file abort! Unknown Error! Please contact your server administrator!");
            }
        }
        return false;
    }
};



m.copyFileList = function (clientID, userID, copyObject) {
    var copylist = [];
    for (i in copyObject.files) {
        var cid = copyObject.files[i];
        var first = cid.substr(0, 1);
        if (first == '4' || first == '5') {
            copylist = m.copyFolder(copylist, clientID, userID, cid, copyObject.toid, 0);
        }
        if (first == '3') {
            copylist = m.copyFile(copylist, clientID, userID, cid, copyObject.toid);
        }
    }
    //log(JSON.stringify(copylist));
    var addlinklist = [];
    var id = "";
    // BLOCK DirObject Save
    m.editDirObject = true;
    for (i in copylist) {
        if (copylist[i].job == 'addLink') {
            addlinklist.push(copylist[i]);
        }
        if (copylist[i].job == 'addfolder') {
            id = copylist[i].id;
            m.dirObject[id] = {};
            m.dirObject[id].owner = copylist[i].owner;
            m.dirObject[id].parent = copylist[i].parent;
            m.dirObject[id].name = copylist[i].name;
            m.dirObject[id].content = [];
            m.dirObject[id].share = m.generateSubFileShare(copylist[i].parent);
            m.dirObject[id].lastmod = copylist[i].lastmod;
        }
        if (copylist[i].job == 'addfile') {
            id = copylist[i].id;
            m.dirObject[id] = {};
            m.dirObject[id].owner = copylist[i].owner;
            m.dirObject[id].parent = copylist[i].parent;
            m.dirObject[id].name = copylist[i].name;
            m.dirObject[id].share = m.generateSubFileShare(copylist[i].parent);
            m.dirObject[id].lastmod = copylist[i].lastmod;
            m.copyFileOnDisc(copylist[i].oldid, id);
        }
    }
    //addlinklist.reverse();
    for (i in addlinklist) {
        m.addLink(addlinklist[i].toid, addlinklist[i].newID);
    }

    // UNBLOCK DirObject Save
    m.editDirObject = false;

    //m.generateUserFilelist(clientID, userID);
    var infolist = m.joinArrays(m.getFileClients(copyObject.toid), m.getFileClients(copyObject.fromid));
    infolist = m.joinArrays(infolist, [clientID]);
    for (key in infolist) {
        if (infolist[key] in L3.users && 'userID' in L3.users[infolist[key]]) {
            m.generateUserFilelist(infolist[key], L3.users[infolist[key]].userID);
        }
    }
    m.saveDirObject(false);
};

m.copyFile = function (copylist, clientID, userID, id, toid) {
    if (fRights.isUserAllowedTo(id, userID, 'read')) {
        if (m.dirObject[userID].storageScore + m.size["3"] <= m.dirObject[userID].maxStorageScore) {
            var typ = "3";
            var newID = m.makeID(typ);

            var x = {};
            x.job = 'addfile';
            //m.dirObject[newID] = { };
            x.oldid = id;
            x.id = newID;
            x.owner = userID;
            x.parent = toid;
            if (m.dirObject[id].parent == toid) {
                x.name = m.dirObject[id].name + ' (copy)';
            } else {
                x.name = m.dirObject[id].name;
            }
            x.share = m.generateSubFileShare(toid); //JSON.parse(JSON.stringify(m.dirObject[id].share)); // probably problematic when share = object
            x.lastmod = new Date().getTime();

            var y = {};
            y.job = 'addLink';
            y.toid = toid;
            y.newID = newID;

            copylist.push(x);
            copylist.push(y);
            //m.addLink(toid, newID);
            //m.writeStr(newID, 'newfile', m.dirObject[newID].name);
            //m.copyFileOnDisc(id, newID);
        } else {
            L2x1.send(clientID, sID.message, "Copying file abort! Your storage is full!");
        }
    } else {
        L2x1.send(clientID, sID.message, "Copying file abort! Permission Denied!");
    }
    return copylist;
};

m.copyFolder = function (copylist, clientID, userID, id, toid, deep) { // ==== RECURSIVE ==== !!!!!!!!!!!!!!!!!!!!!
    if (fRights.isUserAllowedTo(id, userID, 'read')) {
        deep++;
        if (deep > 990) {
            log(" W A R N I N G  copy abort => looped to long! ID: " + id + " TOID: " + toid + " USERID: " + userID + " CLIENTID: " + clientID);
        } else {
            var typ = "4";
            var newID = m.makeID(typ);

            var x = {};
            x.job = 'addfolder';
            x.oldid = id;
            x.id = newID;
            x.owner = userID;
            x.parent = toid;
            if (m.dirObject[id].parent == toid) {
                x.name = m.dirObject[id].name + ' (copy)';
            } else {
                x.name = m.dirObject[id].name;
            }
            x.content = [];
            x.share = m.generateSubFileShare(toid); // probably problematic when share = object
            x.lastmod = new Date().getTime();

            var y = {};
            y.job = 'addLink';
            y.toid = toid;
            y.newID = newID;

            copylist.push(x);
            copylist.push(y);
            //m.addLink(toid, newID);
            for (i in m.dirObject[id].content) {
                var cid = m.dirObject[id].content[i];
                var first = cid.substr(0, 1);
                if (first == '4' || first == '5') {
                    copylist = m.copyFolder(copylist, clientID, userID, cid, newID, deep);
                }
                if (first == '3') {
                    copylist = m.copyFile(copylist, clientID, userID, cid, newID);
                }
            }
        }
    } else {
        L2x1.send(clientID, sID.message, "Copying file abort! Permission Denied!");
    }

    return copylist;
};

m.addLink = function (id, linkID) {
    if (m.dirObject[id] && m.dirObject[linkID]) {
        var key = m.dirObject[id].content.indexOf(linkID);
        if (key == -1) {
            m.dirObject[id].content.push(linkID);
        }
        key = null;
        var key = m.dirObject[linkID].links.indexOf(id);
        if (key == -1) {
            m.dirObject[linkID].links.push(id);
        }
    } else {
        error.report(6, "ID '" + id + "' or '" + linkID + "' does not exist in dirObject! [fileSystemJson:addLink]");
    }
};

m.removeLink = function (id, linkID) {
    if (m.dirObject[id] && m.dirObject[linkID]) {
        var key = m.dirObject[id].content.indexOf(linkID);
        m.dirObject[id].content.splice(key, 1);
        key = null;
        var key = m.dirObject[linkID].links.indexOf(id);
        m.dirObject[linkID].links.splice(key, 1);
    } else {
        error.report(6, "ID '" + id + "' or '" + linkID + "' does not exist in dirObject! [fileSystemJson:removeLink]");
    }
};

m.generateSubFileShare = function (superID) {
    if (m.dirObject[superID].share['*']) {
        return {
            '*': JSON.parse(JSON.stringify(m.dirObject[superID].share['*']))
        };
    } else {
        return {};
    }
};

m.generateUserFilelist = function (clientID, userID) {
    m.generateUserFilelistJSON(clientID, userID);
    /*output = [];
        counter = 0;
        output[counter] = userID+''+m.dirObject[userID].name+';'+m.dirObject[userID].content;
        counter++;
        for(key in m.dirObject){
            share = m.dirObject[key].share.split(";");
            if(userID == m.systemUsr || m.dirObject[key].owner == userID || searchArray(share, userID)){
                var beginn = key.substr(0, 1);
                if(beginn=="3"){
                    output[counter] = key+''+m.dirObject[key].name;
                    counter++;
                }
                if(beginn=="4" || beginn=="5" || beginn=="6"){
                    output[counter] = key+''+m.dirObject[key].name+';'+m.dirObject[key].content;
                    counter++;
                }
            }
        }
        L2x1.send(clientID, sID.fileList, output.join(":"));
        //m.generateUserFilelistJSON(clientID, userID);*/
    //console.log(output.join(":"));
}

m.generateUserFilelistJSON = function (clientID, userID) {
    output = {};
    counter = 0;
    //output[counter] = userID+''+m.dirObject[userID].name+';'+m.dirObject[userID].content;
    //output[userID] = JSON.parse( JSON.stringify( a ) );
    counter++;
    var score = 0;
    var temp = "";
    for (key in m.dirObject) {
        if (fRights.isUserAllowedTo(key, userID, 'read')) {
            temp = JSON.stringify(m.dirObject[key]);
            output[key] = JSON.parse(temp); // Makes a Copy of the Object
            if (m.dirObject[key].share[userID] && m.dirObject[key].share[userID].a != "n" && m.dirObject[key].parent != m.deleteDir) {
                switch (key[0]) {
                case "4":
                    score += temp.length;
                    break;
                case "3":
                    var size = m.dirObject[key].size || m.size["3"];
                    score += temp.length + size;
                    break;
                }
            }
        }
    }
    output.storageScore = score;
    output.maxStorageScore = m.dirObject[userID].maxStorageScore || 500;
    m.dirObject[userID].storageScore = score;
    L2x1.send(clientID, sID.fileList, JSON.stringify(output));
    //console.log(JSON.stringify(output));
};

m.isSubOrdered = function (superID, subID) {
    log("isSubordered('" + superID + "', '" + subID + "');");
    var id = superID;
    var i = 0;
    var idarr = [];
    idarr.push(id);
    while (id != subID && id != m.systemUsr && i < 10) {
        id = m.dirObject[id].parent;
        idarr.push(id);
        i++;
        dlog("isSubOrdered" + i);
    }
    log(JSON.stringify(idarr));
    if (idarr.indexOf(subID) != -1) {
        return true;
    }
    if (i > 990) {
        log(" W A R N I N G  fileSystemJson.js looped to long!");
        return true;
    }
    return false;
};

m.setFileInfo = function (clientID, userID, fileInfo) {
    if ('name' in fileInfo) {
        if (fRights.isUserAllowedTo(fileInfo.id, userID, 'write')) {
            m.dirObject[fileInfo.id].name = m.unescape(fileInfo.name);
            var list = m.getFileClients(fileInfo.id);
            for (key in list) {
                if (list[key] != clientID) {
                    if (list[key] in L3.users && 'userID' in L3.users[list[key]]) {
                        m.generateUserFilelist(list[key], L3.users[list[key]].userID);
                    } else {
                        log("Cannot find Client " + list[key]);
                    }
                }
            }
            m.saveDirObject(false);
        } else {
            m.generateUserFilelist(clientID, userID);
            L2x1.send(clientID, sID.message, "Rename file abort! Permission Denied!");
        }
    }
    if ('share' in fileInfo) {
        if (fRights.isUserAllowedTo(fileInfo.id, userID, 'perm')) {
            if ((m.dirObject[fileInfo.id].share['*'] && m.dirObject[fileInfo.id].share['*'].f == fileInfo.id) || m.getObjectSize(m.dirObject[fileInfo.id].share) == 0) {
                var list1 = m.getFileClients(fileInfo.id);
                for (i in fileInfo.share) {
                    if (!m.dirObject[fileInfo.id].share[i]) {
                        if (i == userID) {
                            fileInfo.share[i].a = "y";
                        } else {
                            fileInfo.share[i].a = "w";
                        }
                    } else {
                        if (i != '*') {
                            fileInfo.share[i].a = m.dirObject[fileInfo.id].share[i].a;
                        } else {
                            fileInfo.share[i].f = m.dirObject[fileInfo.id].share[i].f;
                        }
                    }
                }
                var linkexists = m.checkLinkExists(m.dirObject[fileInfo.id].share, fileInfo.share, fileInfo.id);
                m.dirObject[fileInfo.id].share = fileInfo.share;
                for (i in m.dirObject[fileInfo.id].share) {
                    if ((m.dirObject[fileInfo.id].share[i].a == "w" || linkexists[i] == true) && i != m.guestUser) { // linkexists[i] == true Means Link does not exists
                        m.dirObject[fileInfo.id].share[i].a = "n"
                        m.dirObject[i].notifications.push({
                            "type": "shareadd",
                            "who": userID,
                            "id": fileInfo.id
                        });
                    }
                }
                var list2 = m.getFileClients(fileInfo.id);
                var list = m.joinArrays(list1, list2);
                for (key in list) {
                    if (list[key] != clientID) {
                        if (list[key] in L3.users && 'userID' in L3.users[list[key]]) {
                            m.generateUserFilelist(list[key], L3.users[list[key]].userID);
                        }
                    }
                }
                L3.updateFileRightsOfFile(fileInfo.id);
                m.saveDirObject(false);
            } else {

            }
        } else {
            m.generateUserFilelist(clientID, userID);
            L2x1.send(clientID, sID.message, "Change file config abort! Permission Denied!");
        }
    }
    //m.generateUserFilelist(clientID, userID);
};

m.acceptFileShare = function (clientID, userID, obj) {
    switch (obj.type) {
    case "shareadd":
        var list = m.getFileClients(obj.id + "");
        if (obj.accept == true) {
            m.addLinkAnywhere(clientID, userID, obj.id);
            m.dirObject[obj.id].share[userID].a = "y";
        } else {
            delete m.dirObject[obj.id].share[userID];
        }
        delete obj.accept;
        m.deleteNotification(clientID, userID, obj);
        for (key in list) {
            if (list[key] in L3.users && 'userID' in L3.users[list[key]]) {
                m.generateUserFilelist(list[key], L3.users[list[key]].userID);
            }
        }
        break;
    }
    m.saveDirObject(false);
};

m.deleteNotification = function (clientID, userID, obj) {
    switch (obj.type) {
    case "shareadd":
        var kill = [];
        for (i in m.dirObject[userID].notifications) {
            if (JSON.stringify(m.dirObject[userID].notifications[i]) == JSON.stringify(obj)) {
                kill.push(i);
            }
        }
        for (i in kill) {
            m.dirObject[userID].notifications.splice(kill[i], 1);
        }
        break;
    }
};

m.makeid = function (type) {
    var id = Math.random().toString(36).substring(2, 11);
    return type + "" + id;
};

m.makeID = function (type) {
    var id = m.makeid(type);
    while (id in m.dirObject) {
        id = m.makeid(type);
        dlog("MakeID");
    }
    return id;
};

m.unescape = function (str) {
    while (str[0] == " ") {
        str = str.substr(1);
        dlog("Unescape1");
    }
    while (str[str.length - 1] == " ") {
        str = str.substr(0, str.length - 1);
        dlog("Unescape2");
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

m.getFileClients = function (id) {
    var userList = [];
    var clientList = [];
    userList.push(m.dirObject[id].owner);
    for (key in m.dirObject[id].share) {
        userList.push(key);
    }
    for (key in userList) {
        for (data in L3.users) {
            if (L3.users[data].userID == userList[key]) {
                clientList.push(data);
            }
        }
    }
    return clientList;
};

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

m.addLinkAnywhere = function (clientID, userID, id) {
    m.addLink(userID, id);
};

m.getUserStorageScore = function (clientID, userID) {

};

// Smart Saver =====================================

m.maxNotSavedTime = 180000; // 180000 = 3 Minutes
m.maxIdleTime = 5000; // 5000 = 5 Seconds
m.intervalTime = 5000;

m.isSaved = true;
m.editDirObject = false;
m.forceNextSave = false;

m.timeFirstNotSave = 0;
m.timeLastSave = 0;
m.timeLastChange = 0;

m.saveDirObject = function (force) {
    if (force == true) {
        m.forceNextSave = true;
    }
    if (m.isSaved == true) {
        m.timeFirstNotSave = Date.now();
    }
    m.timeLastChange = Date.now();
    m.isSaved = false;
    //clearTimeout(m.waitSaveTimer);
    //m.waitSaveTimer = setTimeout(m.forceSave, m.waitSaveTime);
};

m.checkToSave = function () {
    if (!m.isSaved) {
        var toLongNotSaved = Date.now() - m.timeFirstNotSave > m.maxNotSavedTime;
        var toLongIdle = Date.now() - m.timeLastChange > m.maxIdleTime;
        var force = m.forceNextSave;
        if (toLongNotSaved || toLongIdle || force) {
            if (m.editDirObject == false) {
                m.writeStr(12, 'dir', 12);
                m.isSaved = true;
                m.forceNextSave = false;
                m.timeLastSave = Date.now();
            }
        }
    }
};

m.init = function () {
    //setInterval(m.checkToSave, m.intervalTime);
};


//var pfile = new pfile_typ();

//module.exports = pfile_typ;

//m.readStr('123', 'dir', 2);
//var tea = { };
//tea['1002343355'] = "0392041400TEST IST DAS GEIL";
//tea['1031111111'] = "Dies ist eine Ueberschrift";
//tea['1009999409'] = "0133128400Dies ist keine Ueberschrift";
//m.writeStr('3emqfb6uw2', 'file', 12);