angular.module('bauhaus.page.services', []);

angular.module('bauhaus.page.services').factory('Page', function ($resource) {
    return $resource('api/Pages/:pageId', {}, {
        get: {
            method: 'GET',
            params: { pageId: 'pageId' },
            isArray: false
        },
        put: {
            method: 'PUT',
            params: { pageId: '@_id' }
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

angular.module('bauhaus.page.services').factory('PageType', function ($resource) {
    return $resource('api/PageTypes', {}, {
        get: {
            method: 'GET',
            isArray: false
        }
    });
});

angular.module('bauhaus.page.services').factory('Content', function ($resource) {
    return $resource('api/Contents/:contentId', {}, {
        get: {
            method: 'GET',
            params: { contentId: '@_id' }
        },
        put: {
            method: 'PUT',
            params: { contentId: '@_id' }
        }
    });
});

angular.module('bauhaus.page.services').factory('PageContent', function ($resource) {
    return $resource('api/Contents?conditions={"_page":":pageId"}', {}, {
        get: {
            method: 'GET',
            params: { pageId: '@pageId' },
            isArray: true
        }
    });
});