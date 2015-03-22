var rightsMiddleware = require('./rightsMiddleware.js');
var pkgcloud = require('pkgcloud');
var pkgcloudClient = require('./pkgCloudClient.js');
var express = require('express');



module.exports = function (bauhausConfig) {
    'use strict';

    var pkgclient = pkgcloudClient(bauhausConfig);

    var app = express();

    app.use(rightsMiddleware());

    app.use(function (req, res, next) {
        var splittedPath = req.path.split('/');
        if (req.path[0] === "/") {
            splittedPath.shift();
        }
        var remote = decodeURI(splittedPath.pop());
        var container = decodeURI(splittedPath.join('.'));
        console.log('remote', remote);
        console.log('container', container);

        pkgclient.getFile(container, remote, function (err, file) {
            if (err != null || file == null) {
                res.status(404).send('Error 404: Not found!');
            } else {
                var contentTypeTest = RegExp(/[.]*\/[.]*/g);
                if (!contentTypeTest.test(file.contentType)) {
                    res.status(500).send('Error 500: Content-Type of requested file defect or not available!');
                } else {
                    res.setHeader("content-type", file.contentType);

                    pkgclient.download({
                        container: container, //'testcontainer',
                        remote: remote //'remote-test1-double.jpg'
                    }).pipe(res);
                }
            }
        });
    });

    //app.use(express.static(pathconfig.filesDir));

    return app;

}