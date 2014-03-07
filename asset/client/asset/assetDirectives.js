angular.module('bauhaus.asset.directives', ['bauhaus.asset.services']);

angular.module('bauhaus.asset.directives').directive('bauhausAssetData', function (AssetService, $upload) {
    return {
        restrict: 'AEC',
        template: '<div class="page-content-field">' +
                  '     <label class="page-content-field-label">{{config.label}}</label>' +
                  '     <input type="file" ng-file-select="onFileSelect($files)">' +
                  '     <div ng-show="isImage" class="ng-hide"><img ng-src="/assets/{{asset._id}}?transform=resize&width=100&height=100&reload={{ reloadImage }}"></button>' +
                  '</div>',
        scope: {
            value: '=ngModel',
            config: '=fieldConfig'
        },
        link: function (scope, el, attr) {
            scope.asset = undefined;
            scope.isImage = false;
            scope.reloadImage = '';

            scope.$watch('$parent.doc', function (newVal, oldVal) {
                if (newVal && newVal._id) {
                    scope.uploadUrl = 'api/Assets/' + newVal._id;
                    scope.asset = newVal;

                    if (newVal.metadata && newVal.metadata['content-type']) {
                        var isImageContentType = /^image\//;

                        if (newVal.metadata['content-type'].match(isImageContentType) !== null) {
                            scope.isImage = true;
                        } else {
                            scope.isImage = false;
                        }
                    }
                }
            });

            scope.onFileSelect = function($files) {
                for (var i = 0; i < $files.length; i++) {
                    var file = $files[i];
                    scope.upload = $upload.upload({
                        url: scope.uploadUrl,
                        method: 'POST',
                        headers: {},
                        // withCredentials: true,
                        //data: {myObj: $scope.myModelObj},
                        file: file,
                        fileFormDataName: 'data',
                    }).progress(function(evt) {
                        console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
                    }).success(function(data, status, headers, config) {
                        // file is uploaded successfully
                        if (data && data._id) {
                            scope.asset = data;
                            scope.reloadImage = new Date().getTime();
                        }
                    });
                  //.error(...)
                }
            };
        }
    };
});
