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

angular.module('bauhaus.user.services').factory('CustomUserFields', function ($resource) {
    return $resource('api/CustomUserFields', {}, {
        query: {
            method: 'GET',
            isArray: true
        }
    });
});

angular.module('bauhaus.user.services').factory('SharedCustomUserFields', function ($rootScope, CustomUserFields) {
    var scope = $rootScope.$new();
    scope.store =  {
        fields: [],
        reload: function (callback) {
            CustomUserFields.query({}, function (result) {
                scope.store.fields = [];
                
                for (var id in result) {
                    if (result[id].type) {
                        scope.store.fields.push(result[id]);
                    }
                }
                if (typeof callback === 'function') callback();
            });     
        }
    };

    scope.store.reload();

    return scope;
});