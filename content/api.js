var baucis = require('baucis');

module.exports = function (mongoose, plugin) {
    baucis.rest({
        singular:'Content', 
        select:'_type content meta _page', swagger: true
    });

    var api = baucis();


    api.get('/ContentTypes', function (req, res, next) {
        console.log(plugin.types)
        res.json(plugin.types);
    });

    return api;
}