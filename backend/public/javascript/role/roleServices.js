angular.module('bauhaus.role.services', []);

angular.module('bauhaus.role.services').factory('Role', function ($resource) {
    return $resource('api/Roles/:roleId', { roleId: '@_id' }, {
        get: {
            method: 'GET',
            params: { roleId: 'roleId' },
            isArray: false
        },
        query: {
            method: 'GET',
            isArray: true
        },
        put: {
            method: 'PUT'
        },
        delete: {
            method: 'DELETE',
            params: { roleId: '@_id' }
        },
        create: {
            method: 'POST',
            params: { roleId: '' }
        }
    });
});

angular.module('bauhaus.role.services').factory('SharedRoles', function ($rootScope, Role) {
    var scope = $rootScope.$new();
    scope.store =  {
        all: {},
    };

    Role.query({}, function (result) {
        for (var id in result) {
            if (result[id]._id) {
                scope.store.all[ result[id]._id ] = result[id];
            }
        }
    });

    return scope;
});