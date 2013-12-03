var mongoose = require('mongoose');

module.exports = function setup(options, imports, register) {
    var connection = (options.connection !== undefined) ? options.connection : 'mongodb://localhost/bauhausjs';
    mongoose.connect(connection);

    register(null, {});
};