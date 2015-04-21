var baucis = require('baucis'),
    Page = require('./model/page'),
    mongoose = require('mongoose'),
    express = require('express');

module.exports = function (bauhausConfig) {

    var pageController = baucis.rest(mongoose.model('Page')).select('_type _w name route title label parentId path public isSecure roles');

    var getTree = function (request, response, next) {
        // Setting pageId to null finds root
        var pageId = request.params.id;

        var query = {};
        if (pageId) {
            query['_id'] = pageId;
        } else {
            query['parentId'] = null;
        }

        Page.findOne(query, function (err, doc) {
            doc.getTree({ _sort: { _w: 1 } }, { _sort: { _w: 1 } }, function (err, tree) {
                response.json({tree: tree});
            });
        });
    };

    var app = express();

    pageController.get('/gettree/:id?', getTree);
  
    // Add page Types to API
    pageController.get('/pagetypes', function (req, res) {
        res.json(bauhausConfig.pageTypes);
    });

    return pageController;
}