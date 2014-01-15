angular.module('bauhaus.user.services', []);

angular.module('bauhaus.user.services').factory('User', function ($resource) {
    return $resource('api/Users/:userId', { userId: '@_id' }, {
        get: {
            method: 'GET',
            params: { userId: 'userId' },
            isArray: false
        },
        query: {
            method: 'GET',
            params: { userId: '' },
            isArray: true
        },
        put: {
            method: 'PUT'
        },
        delete: {
            method: 'DELETE',
            params: { userId: '@_id' }
        },
        create: {
            method: 'POST',
            params: { userId: '' }
        }
    });
});