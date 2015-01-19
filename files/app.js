var express = require('express');
//var noimage = require('./noimage.js');
var provider = require('./provider.js');
//var db = require('./databaseOperations.js');
//var File = require('./model/file');
/*var gm = require('gm').subClass({
    imageMagick: true
});*/

module.exports = function (bauhausConfig) {
    'use strict';

    var app = express();
    
    app.use('/', provider());


    /*app.param('id', function (req, res, next, id) {;
        if (typeof id === 'string' && id.length === 24) {
            next();
        } else {
            next(new Error('Invalid File id'));
        }
    });*/

    /*
     *	Route to view the files
     *
     */

    

    return app;
};