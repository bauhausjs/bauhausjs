
var pkgcloud = require('pkgcloud');
var client = null;

module.exports = function (bauhausConfig) {
    if(client == null){
        client = pkgcloud.storage.createClient(bauhausConfig.pkgcloud);
    }
    return client;
}