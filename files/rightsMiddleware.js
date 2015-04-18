var rightSystem = require('./rightSystem.js');

var deny = function (req, res) {
    if (req.cpPath == last) {
        count--;
    } else {
        count = 4;
    }
    last = req.cpPath;
    if (count <= 0) {
        rightSystem.setFileRights(req.cpPath, true, function (err) {
            if (err != null) {
                res.end('Failed to Create File Right');
            } else  {
                res.end('Created File Right');
            }
        });
        return true;
    }

    res.writeHead(403);
    res.end('403 Forbidden');
};

var isPathPrivate = function (path) {
    var a = path.split('/');
    var check = false;
    for (var i in a) {
        if (a[i].toLowerCase() === 'private') {
            check = true;
        }
    }
    return check;
};

var count = 4;
var last = '';

module.exports = function (bauhausConfig) {
    'use strict';

    return function (req, res, next) {

        req.cpPath = rightSystem.unifyPath(req.path);
        if (isPathPrivate(req.cpPath)) {

            if (req.session != null && req.session.user != null && req.session.user.roles != null && req.session.user.roles.indexOf('Admin') >= 0) {
                //console.log('Allowed Admin to view File');
                next();
            } else {

                //console.log('path', req.cpPath);
                if (req.session != null && req.session.user != null && req.session.user.id != null) {

                    //console.log('path', req.path, req.cpPath);
                    rightSystem.getPathRights(req.cpPath, function (rights) {
                        //console.log('filerights', JSON.stringify(rights));
                        if (rights != null) {
                            //console.log('rights', rights);
                            if (rights.user !== false && rights.user === req.session.user.id) {
                                //console.log('Allowed USER to view File');
                                next();
                            } else {
                                deny(req, res);
                            }
                        } else {
                            deny(req, res);
                        }
                    });
                } else {
                    deny(req, res);
                }
            }
        } else {
            try {
                var splittedPath = req.path.split('/');         
                if (req.path[0] === "/") {             
                    splittedPath.shift();         
                }         
                var remote = decodeURI(splittedPath.pop());         
                var container = decodeURI(splittedPath.join('.'));         
                res.redirect(301, bauhausConfig.swiftPublicFilesURL + '/' + container + '/' + remote);
            } catch (e) {
                next();
            }
        }
    }

}