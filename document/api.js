var express = require('express');

module.exports = function (bauhausConfig) {
    var app = express();

    app.get('/Documents', function (req, res, next) {
        res.json(bauhausConfig.documents);
    });

    return app;
}