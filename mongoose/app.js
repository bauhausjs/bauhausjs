var mongoose = require('mongoose');

module.exports = function setup(options, imports, register) {
    var connection = (options.connection !== undefined) ? options.connection : 'mongodb://localhost/bauhausjs';
    mongoose.connect(connection);

    var plugin = {
        connection: mongoose.connection,
        mongoose: mongoose
    };

    register(null, {
        mongoose: plugin
    });
};