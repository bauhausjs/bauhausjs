
var helper = module.exports = {};

helper.populateConfig = function (config, pathPrefix) {
    pathPrefix = pathPrefix || '';

    var populate = [];

    if (config && config.fields) {
        var fields = config.fields;
        for (var f in fields) {
            var field = fields[f];
            if (field.type === 'relation' && field.options && field.options.model) {
                var model = field.options.model;
                populate.push({
                    path: pathPrefix + field.name,
                    model: model
                });
            }
        }
    } 

    return populate;
};