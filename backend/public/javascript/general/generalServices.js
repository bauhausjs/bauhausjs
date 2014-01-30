angular.module('bauhaus.general.services', []);

angular.module('bauhaus.general.services').factory('Documents', function ($resource) {
    return $resource('api/Documents', {}, {
        get: {
            method: 'GET',
            isArray: false
        }
    });
});

angular.module('bauhaus.general.services').factory('SharedDocuments', function (Documents, $rootScope) {
    var scope = $rootScope.$new();
    scope.store =  {
        all: {},
    };

    Documents.get(function (result) {
        console.log(result);
        for (var key in result) {
            if (result[key].name) {
                scope.store.all[key] = result[key];
            }
        }
    });

    return scope;
});