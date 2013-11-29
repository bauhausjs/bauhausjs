var express = require('express');

module.exports = function setup(options, imports, register) {
    var app = express();
    var port = options.port || 3000;

    app.listen(port);

    register(null, {
        server: { app: app },
    });
};