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
            }
        });
    }
});