var rightSystem = require('./rightSystem.js');

var deny = function (req, res) {
    /*if (req.cpPath == last) {
        count--;
    } else {
        count = 4;
    }
    last = req.cpPath;
    if (count <= 0) {
        rightSystem.setFileRights(req.cpPath, true, function (err) {
            if (err) {
                res.end('Failed to Create File Right');
            } else  {
                res.end('Created File Right');
            }
        });
        return true;
    }*/

    res.writeHead(403);
    res.end('403 Forbidden');
};

var count = 4;
var last = '';

module.exports = function (bauhausConfig) {
    'use strict';

    return function (req, res, next) {
        if (req.session && req.session.user && req.session.user.roles && req.session.user.roles.indexOf('Admin') >= 0) {
            //console.log('Allowed Admin to view File');
            next();
        } else {
            req.cpPath = rightSystem.unifyPath(req.path);

            //console.log('path', req.path, req.cpPath);
            rightSystem.getPathRights(req.cpPath, function (rights) {
                if (rights) {
                    if (rights.visible) {
                        next();
                    } else {
                        deny(req, res);
                    }
                } else {
                    console.log('rights object is undefined => should not be possible');
                    deny(req, res);
                }
            });
        }
    }

}