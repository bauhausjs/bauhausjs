var baucis = require('baucis');

module.exports = function (mongoose, plugin) {

    var pageController = baucis.rest({
        singular:'Page', 
        select:'_type name route title label parentId path public'
    });

    var getTree = function (request, response, next) {
        // Setting pageId to null finds root
        var pageId = request.params.id;

        var query = {};
        if (pageId) {
            query['_id'] = pageId;
        } else {
            query['parentId'] = null;
        }

        mongoose.models.Page.findOne(query, function (err, doc) {
            doc.getTree(function (err, tree) {
                response.json({tree: tree});
            });
        });
    };

    pageController.get('/getTree/:id?', getTree);


    // Create page REST middleware
    var api = baucis({swagger:true});    
    // Add page Types to API
    api.get('/PageTypes', function (req, res) {
        res.json(plugin.types);
    });

    return api;
}