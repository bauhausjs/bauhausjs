angular.module('bauhaus.document.services', []);

angular.module('bauhaus.document.services').factory('DocumentService', function ($resource) {
    return function (type) {
        return $resource('api/' + type + '/:id', { id: '@_id' }, {
            get: {
                method: 'GET',
                params: { id: 'id' },
                isArray: false
            },
            query: {
                method: 'GET',
                params: { id: '' },
                isArray: true
            },
            put: {
                method: 'PUT'
            },
            delete: {
                method: 'DELETE',
                params: { id: '@_id' }
            },
            create: {
                method: 'POST',
                params: { id: '' }
            },
            info: {
                method: 'GET',
                params: { id: 'info' }
            }
        });
    }
});

/* Replaces all objects with a field _id by a string of the id */
angular.module('bauhaus.document.services').factory('unpopulateDoc', function () {
    return function unpopulateDoc (object) {
        var obj = angular.copy(object);
        for (var f in obj) {
            if (obj.hasOwnProperty(f)) {
                var field = obj[f];
                // replace field with object by id
                if (typeof field === 'object' && field._id) {
                    obj[f] = field._id;
                }
                // replace field with array of objects by array of ids
                if (Array.isArray(field) &&
                    field.length > 0 &&
                    typeof field[0] === 'object' &&
                    field[0]._id) {

                    var ids = [];
                    for (var o in field) {
                        if (field[o]._id) {
                            ids.push(field[o]._id);
                        }
                    }
                    obj[f] = ids;
                }
            }
        }
        return obj;
    }
});


