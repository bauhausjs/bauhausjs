var express = require('express');
var db = require('./databaseOperations.js');
var File = require('./model/file');


module.exports = function (bauhausConfig) {
    'use strict';

    var app = express();


    app.param('id', function (req, res, next, id) {;
        if (typeof id === 'string' && id.length === 24) {
            next();
        } else {
            next(new Error('Invalid File id'));
        }
    });

    /*
     *	Route to view the files
     *
     */
    app.get('/:id', function (req, res, next) {
        var routeParams = req.route.params,
            id = routeParams.id,
            query = req.query; //contains the urls query parameters

        console.log(id);

        db.getFile(id).then(function (data) {
            sendFile(res, data.buffer, data.metadata["content-type"]);
        }, function (err) {
            console.error(err);
            res.writeHead(500);
            res.end("Some database error!");
        });

    });

    function sendFile(res, data, contentType) {
        res.setHeader('Content-Type', contentType);
        res.writeHead(200);
        return res.end(data);
    }

    return app;
};