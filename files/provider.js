var rightsMiddleware = require('./rightsMiddleware.js');
var pathconfig = require('./pathconfig.js');
var path = require('path');
var express = require('express');

module.exports = function (req, res, next) {
    'use strict';

    var app = express();

    app.use(rightsMiddleware());

    app.use(express.static(pathconfig.filesDir));

    return app;

}