angular.module('bauhaus.asset.directives', ['bauhaus.asset.services']);

angular.module('bauhaus.asset.directives').directive('bauhausAssetData', function (DocumentService, AssetUploadService, $upload) {
    return {
        restrict: 'AEC',
        template: '<div class="page-content-field">' +
                  '     <label class="page-content-field-label">{{config.label}}</label>' +
                  '     <input type="file" ng-file-select="onFileSelect($files)">' +
                  '     <i class="fa fa-spinner" ng-show="uploading"></i>' +
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
            scope.uploading = false;

            var AssetService = DocumentService('Assets');

            scope.$watch('$parent.doc', function (newVal, oldVal) {
                if (newVal && newVal._id) {
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
                    scope.uploading = true;

                    function upload () {
                        scope.uploadUrl = 'api/Assets/' + scope.$parent.doc._id;
                        scope.upload = $upload.upload({
                            url: scope.uploadUrl,
                            method: 'POST',
                            headers: {},
                            // withCredentials: true,
                            //data: {myObj: $scope.myModelObj},
                            file: file,
                            fileFormDataName: 'data',
                        }).progress(function(evt) {
                            //console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
                        }).success(function(data, status, headers, config) {
                            console.log('uploaded', data)
                            // file is uploaded successfully
                            if (data && data._id) {
                                //scope.asset = data;
                                scope.$parent.doc = data;
                                scope.$parent.$parent.documentId = data._id;
                                scope.reloadImage = new Date().getTime();
                            }
                            scope.uploading = false;
                        })
                        .error(function () {
                            scope.uploading = false;
                        });
                    }

                    if (!scope.$parent.doc._id) {
                        AssetService.create(function (result) {
                            scope.$parent.doc = result;
                            upload();
                        });
                    } else {
                        upload();
                    }
                    
                }
            };
        }
    };
});

angular.module('bauhaus.asset.directives').directive('bauhausAssetMetaData', function (DocumentService, AssetUploadService, $upload) {
    return {
        restrict: 'AEC',
        template: '<div class="page-content-field">' +
                  '     <label class="page-content-field-label">{{config.label}}</label>' +
                  '     <div ng-repeat="(key, data) in value">' +
                  '         {{key}}: {{data}}' +
                  '     </div>' +
                  '</div>',
        scope: {
            value: '=ngModel',
            config: '=fieldConfig'
        },
        link: function (scope, el, attr) {
            
        }
    };
});


angular.module('bauhaus.document.directives').directive('bauhausImage', function (DocumentService, $timeout) {
    return {
        restrict: 'AEC',
        template: '<div class="page-content-field" ng-blur="showSelect = false">' +
                  '     <label class="page-content-field-label">{{config.label}}</label>' +
                  '     <div class="tag-list" ng-show="value.assets">' +
                  '          <div class="tag" ng-repeat="id in value.assets"><img ng-src="/assets/{{id}}?{{imageQuery}}"><div class="tag-delete" ng-click="removeImage(id)"><span class="fa fa-times"></span></div></div>' +
                  '     </div>' +
                  '     <div ng-show="limit <= value.assets.length">Remove image to add new one. (Limit: {{limit}})</div>' + 
                  '     <div class="suggestions-wrapper">' + 
                  '         <input class="page-content-field-input input-big" type="text" ng-model="search" placeholder="+ Add Image" ng-focus="showSelect = true" ng-blur="blur($event)"/>' +
                  '         <div class="suggestions" ng-show="showSelect" ng-init="showSelect = false">' +
                  '             <div class="suggestions-item clickable" ng-repeat="image in images | filter:search" ng-click="addImage(image)"><img ng-src="/assets/{{image._id}}?{{imageQuery}}" title="{{image.name}} - {{image.metadata.width}}x{{image.metadata.height}}"/></div>' +
                  '         </div>' +
                  '     </div>' + 
                  '</div>',
        scope: {
            value: '=ngModel',
            config: '=fieldConfig'
        },
        link: function (scope, el, attr) {
            // Load labels of related documents
            if (typeof scope.config.options === 'undefined') {
                scope.config.options = {};
            }

            scope.limit = (scope.config.options.limit !== undefined && typeof scope.config.options.limit === 'number') ? scope.config.options.limit : 1;
            scope.imageQuery = 'transform=resize&width=50&height=50';
            scope.images = [];

            scope.blur = function (event) {
                $timeout(function (){
                    scope.showSelect = false;
                }, 200);
            };

            scope.service = DocumentService('Assets');
            var query = {
                conditions: JSON.stringify({
                    parentId: null,
                    'metadata.content-type': {'$regex':'image/*' }
                }),
                select: 'name'
            };

            scope.$watch('showSelect', function (newVal) {
                if (newVal == true && scope.images.length === 0) {
                    scope.service.query(query, function (images) {
                        for (var i in images) {
                            if (images[i]._id) {
                                scope.images.push( images[i] );
                            }
                        }
                    }); 
                }
            });

            scope.addImage = function (image) {
                scope.initValue();
                if (image._id) {
                    if (scope.value.assets.length < scope.limit) {
                        scope.value.assets.push(image._id);
                    }
                }
                scope.showSelect = false;
            };

            scope.removeImage = function (id) {
                var index = scope.value.assets.indexOf( id );
                if (index !== -1) {
                    scope.value.assets.splice(index, 1);
                }
            };

            // Init relation object, of it doesn't exist yet
            scope.initValue = function () {
                if (typeof scope.value !== 'object') {
                    scope.value = {
                        assets: [],
                        query: {}
                    };
                }
            };

        }
    };
});
