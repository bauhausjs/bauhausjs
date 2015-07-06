angular.module('bauhaus.role.services', []);

angular.module('bauhaus.role.services').factory('Role', function ($resource) {
    return $resource('api/roles/:roleId', { roleId: '@_id' }, {
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
        reload: function (callback) {
            Role.query({}, function (result) {
                scope.store.all = {};
                
                for (var id in result) {
                    if (result[id]._id) {
                        scope.store.all[ result[id]._id ] = result[id];
                    }
                }
                if (typeof callback === 'function') callback();
            });     
        }
    };

    scope.store.reload();

    return scope;
});

angular.module('bauhaus.role.services').factory('Permission', function ($resource) {
    return $resource('api/users/currentuser/permissions', {}, {
        query: {
            method: 'GET',
            isArray: false
        }
    });
});

angular.module('bauhaus.role.services').factory('SharedPermissions', function ($rootScope, Permission) {
    var scope = $rootScope.$new();
    scope.store =  {
        all: {},
    };

    Permission.query({}, function (result) {
        for (var service in result) {
            if (Array.isArray(result[service])) {
                scope.store.all[ service ] = result[service];
            }
        }
    });

    return scope;
});