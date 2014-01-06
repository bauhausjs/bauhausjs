var baucis = require('baucis'),
    page = require('./model');

var pageController = baucis.rest({
    singular:'Page', 
    select:'_type name route title label parentId path'
});

var getTree = function (request, response, next) {
    // Setting pageId to null finds root
    var pageId = request.params.id;

    var query = {};
    if (pageId) {
        query['_id'] = pageId;
    } else {
        query['_parentId'] = null;
    }

    page.model.findOne(query, function (err, doc) {

        doc.getTree(function (err, tree) {
            response.json({tree: tree});
        });
    });
};

pageController.get('/getTree/:id?', getTree);

module.exports = baucis({swagger:true});