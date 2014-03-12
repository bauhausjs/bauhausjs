angular.module('bauhaus.asset.services', []);

angular.module('bauhaus.asset.services').factory('AssetUploadService', function ($resource) {

    return $resource('api/Assets/:id/upload', { id: '@_id' }, {
        upload: {
            method: 'POST',
            params: { id: 'id' }
        }
    });

});
