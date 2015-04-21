angular.module('bauhaus.user.services', []);

angular.module('bauhaus.user.services').factory('CurrentUser', function ($resource) {
    return $resource('api/users/currentuser', {}, {
        get: {
            method: 'GET',
            isArray: false
        }
    });
});

angular.module('bauhaus.user.services').factory('SharedCurrentUser', function ($rootScope, CurrentUser) {
    var scope = $rootScope.$new();
    scope.store =  {
        user: null,
        reload: function (callback) {
            CurrentUser.get({}, function (result) {
                scope.store.user = result;
            });     
        }
    };

    scope.store.reload();

    return scope;
});