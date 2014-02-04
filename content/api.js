var baucis = require('baucis');

module.exports = function (mongoose, Content, contentTypes) {
    baucis.rest({
        singular:'Content', 
        select:'_type content meta _page', swagger: true
    });

    var api = baucis();


    api.get('/ContentTypes', function (req, res, next) {
        res.json(contentTypes);
    });

    return api;
}