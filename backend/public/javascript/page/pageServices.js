angular.module('bauhaus.page.services', []);

angular.module('bauhaus.page.services').factory('Page', function ($resource) {
    return $resource('api/Pages/:pageId', {}, {
        get: {
            method: 'GET',
            params: { pageId: 'pageId' },
            isArray: false
        }
    });
});

angular.module('bauhaus.page.services').factory('PageTree', function ($resource) {
    return $resource('api/Pages/getTree', {}, {
        get: {
            method: 'GET',
            isArray: false
        }
    });
});