var express = require('express');
var db = require('./databaseOperations.js');
var File = require('./model/file');
var count = 0;

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

    function saveDataUrl(fileName, dataUrl) {
        //data = data.replace(" ", "+");
        var dataString = dataUrl.split(",");
        var buffer = new Buffer(dataString[1], 'base64');
        var contentType = dataString[0].split(":")[1];
        contentType = contentType.split(";")[0];
        var extension = dataUrl.match(/\/(.*)\;/);
        console.log(contentType);
        var fs = require("fs");
        var fullFileName = fileName + "." + extension[1];
        fs.writeFileSync(fullFileName, buffer, "binary");
        return buffer;
    }

    app.post(pre + '/upload/:id', function (req, res) {
        req.accepts('*');
        try {
            var routeParams = req.route.params;
            var id = routeParams.id;
            var body = req.body || {};
            var dataUrl = body.image;
            var dataString = dataUrl.split(",");
            var buffer = new Buffer(dataString[1], 'base64');
            var contentType = dataString[0].split(":")[1];
            contentType = contentType.split(";")[0];

            var metadata = {
                "content-type": contentType
            };

            db.setFileData(id, buffer, metadata).then(function (data) {
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
        }
    });

    app.get(pre + '/list', function (req, res) {
        req.accepts('*');
        //fs.writeFileSync('data.' + ext, buffer);
        db.getFilesInfoWithoutBuffer().then(function (data) {
            res.json({
                "data": data
            });
        }, function (err) {
            console.error("ERROR: " + err);

            res.json({
                "lol": 42 + count
            });
        });
    });

    app.get(pre + '/view/:id', function (req, res) {
        req.accepts('*');
        var routeParams = req.route.params;
        var id = routeParams.id;
        console.log("ID: " + id);
        //fs.writeFileSync('data.' + ext, buffer);
        db.getFileBuffer(id).then(function (data) {
            res.setHeader('Content-Type', 'image/jpeg');
            res.writeHead(200);
            res.write(data);
            res.end(data);
        }, function (err) {
            console.error("ERROR: " + err);

            res.json({
                "lol": 42 + count
            });
        });
    });

    app.get('/Filesp', function (req, res) {
        req.accepts('*');
        /*db.addFile("SUPIFOLDER",2).then(function(data){
            console.log("MY NEW ID: "+data);
            db.getFilesInfoWithoutBuffer();
        }, function(err){
            console.log('error lol');
            console.log(err);
        });*/
        /*db.deleteFile('5412a57748ff4481452176ed').then(function(data){
            console.log(data);
        }, function(err){
            console.error(err);
        });*/

        /*db.getFilesInfoWithoutBuffer().then(function(data){
            console.log(data);
        }, function(err){
            console.error(err);
        });*/
        count++;
        res.json({
            "lol": 42 + count
        });
    });

    return app;
}