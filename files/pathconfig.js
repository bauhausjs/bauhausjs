var path = require('path');

var m = module.exports = {};

m.appDir = path.dirname(require.main.filename);
m.filesDir = m.appDir + '/files';
m.uploadSubDir = '/tempuploads';
m.uploadDir = m.filesDir + '/tempuploads';