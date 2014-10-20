angular.module('bauhaus.tag.directives', []);


angular.module('bauhaus.tag.directives').directive('bauhausTags', function (DocumentService, $timeout) {
    return {
        restrict: 'AEC',
        template: '<div class="page-content-field" ng-blur="showSelect = false">' +
                  '     <label class="page-content-field-label">{{config.label}}</label>' +
                  '     <div class="tag-list">' +
                  '          <div class="tag" ng-repeat="tag in value">{{tag}} <div class="tag-delete" ng-click="removeTag(tag)"><span class="fa fa-times"></span></div></div>' +
                  '         <div class="suggestions-wrapper">' + 
                  '             <input class="page-content-field-input input-big" type="text" ng-model="search" placeholder="+ Add Tag" ng-focus="showSelect = true" ng-blur="blur($event)"/>' +
                  '             <div class="suggestions" ng-show="showSelect" ng-init="showSelect = false">' +
                  '                 <div class="suggestions-item clickable" ng-show="addTagsAllowed === true && search.length > 2" ng-click="addNewTag(search)">Add new tag <b>{{search}}</b></div>' + 
                  '                 <div class="suggestions-item clickable" ng-repeat="tag in tags | filter:search" ng-click="addTag(tag)">{{tag}}</div>' +
                  '             </div>' +
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

            scope.tags = (Array.isArray(scope.config.options.tags)) ? scope.config.options.tags : [];
            scope.addTagsAllowed = (typeof scope.config.options.addTags === 'boolean') ?  scope.config.options.addTags : true;
            scope.showSuggestions = (typeof scope.config.options.suggestions === 'boolean') ? scope.config.options.suggestions : true;

            scope.blur = function (event) {
                $timeout(function (){
                    scope.showSelect = false;
                }, 200);
            };

            scope.service = DocumentService('Tags');

            scope.$watch('showSelect', function (newVal) {
                if (newVal == true && scope.tags.length === 0) {
                    if (scope.showSuggestions === true) {
                        scope.service.query({}, function (tags) {
                            for (var t in tags) {
                                if (tags[t]._id) {
                                    scope.tags.push( tags[t].name );
                                }
                            }
                        }); 
                    }
                }
            });

            scope.addTag = function (tag) {
                scope.initValue();
                if (tag.length > 1) {
                    scope.value.push(tag);
                    scope.search = '';
                }
                scope.showSelect = false;
            };

            scope.addNewTag = function (tag) {
                if (scope.addTagsAllowed) {
                    scope.service.create({}, function (tagObj) {
                        if (tagObj._id) {
                            tagObj.name = tag;
                            scope.service.put(tagObj, function (updatedTagObj) {
                                scope.initValue();
                                scope.value.push(tag);
                                scope.search = '';
                            });
                        } else {
                            alert('Failed to create tag "' + tag +  '"');
                        }
                    });
                }
            };

            scope.removeTag = function (tag) {
                var index = scope.value.indexOf( tag );
                if (index !== -1) {
                    scope.value.splice(index, 1);
                }
            };

            // Init relation object, of it doesn't exist yet
            scope.initValue = function () {
                if (Array.isArray(scope.value) === false) {
                    scope.value = [];
                }
            };

        }
    };
});

