
angular.module('bauhaus.document.directives').directive('bauhausImage', function ($timeout) {
    return {
        restrict: 'AEC',
        template: '<div class="page-content-field" ng-blur="showSelect = false">' +
            '     <label class="page-content-field-label">{{config.label}}</label>' +
            '     <div class="tag-list" ng-if="value.files.length > 0">' +
            '          <div class="tag" ng-repeat="id in value.files"><img ng-src="/files/asset/{{id}}?{{imageQuery}}"><div class="tag-delete" ng-click="removeImage(id)"><span class="fa fa-times"></span></div></div>' +
            '     </div>' +
            '     <div ng-show="limit <= value.files.length">Remove image to add new one. (Limit: {{limit}})</div>' +
            '     <div class="suggestions-wrapper">' +
            '         <input class="page-content-field-input input-big" type="text" ng-model="search" placeholder="+ Add Image" ng-focus="showSelect = true" ng-blur="blur($event)"/>' +
            '         <div class="suggestions" ng-show="showSelect" ng-init="showSelect = false">' +
            '             <div class="suggestions-item clickable" ng-repeat="image in images | filter:search" ng-click="addImage(image)"><img ng-src="/files/asset/{{image._id}}?{{imageQuery}}" title="{{image.name}}"/></div>' +
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
                $timeout(function () {
                    scope.showSelect = false;
                }, 200);
            };

            scope.$watch('showSelect', function (newVal) {
                if (newVal == true && scope.images.length === 0) {
                    scope.initValue();
                    if (scope.value.dir) {
                        scope.loadlist();
                    } else {
                        if(!scope.$parent.doc._id){
                            return alert('Bitte speichere ein neues Projekt initial bevor du Bilder hinzufügst.');
                        }
                        data.fop({
                            "op": "getfilebyname",
                            "dir": "*root*",
                            "name": "projects"
                        }, function (e) {
                            if (e.success) {
                                var proid = e.id;
                                var name = scope.$parent.doc._id;
                                data.fop({
                                    "op": "getfilebyname",
                                    "dir": proid,
                                    "name": name
                                }, function (e) {
                                    if (e.success) {
                                        scope.value.dir = e.id;
                                        scope.loadlist();
                                    } else {
                                        data.fop({
                                            "op": "add",
                                            "name": name + " : " + scope.$parent.doc.title,
                                            "dir": proid,
                                            "type": 1
                                        }, function (data) {
                                            if (data.success) {
                                                //scope.value.dir = "5437803f1c0359db06c920cc";
                                                alert("Created new Folder in FileSystem!");
                                                scope.value.dir = data.data;
                                                console.log("Data Folder " + data.data);
                                                scope.loadlist();
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    }
                }
            });

            scope.loadlist = function () {
                data.fop({
                    "op": "flist",
                    "id": scope.value.dir
                }, function (data) {
                    if (data.success) {
                        console.log(data.flist);
                        for (var i in data.flist) {
                            scope.images.push(data.flist[i]);
                        }
                        console.log(scope.images);
                        if (!scope.$$phase) {
                            scope.$apply();
                        }
                    }
                });
            };

            scope.addImage = function (image) {
                var image = image;
                //scope.initValue();
                if (image._id) {
                    if (scope.value.files.length < scope.limit && scope.value.files.indexOf(image._id) < 0) {
                        scope.value.files.push(image._id);
                        /*$timeout(function() {
                            scope.$parent.$parent.$apply();
                        });*/
                    }
                }
                scope.showSelect = false;
            };

            scope.removeImage = function (id) {
                var index = scope.value.files.indexOf(id);
                if (index !== -1) {
                    scope.value.files.splice(index, 1);
                }
            };

            // Init relation object, of it doesn't exist yet
            scope.initValue = function () {
                if (typeof scope.value !== 'object') {
                    scope.value = {
                        files: []
                    };
                }
            };

        }
    };
});