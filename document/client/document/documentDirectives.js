angular.module('bauhaus.document.directives', []);

angular.module('bauhaus.document.directives').directive('bauhausDocumentForm', function ($compile) {
    return {
        scope: {
            content: '=ngModel',
            config: '=config'
        },
        link: function (scope, el, attr) {

            function recompileForm () {
                if (scope.config.fields) {
                    var html ='<div>';
                    for (var f in scope.config.fields) {
                        var field = scope.config.fields[f];
                        html += '<bauhaus-' + field.type +
                                ' ng-model="content.' + field.name  +
                                '" field-config="config.fields[' + f + ']" ></bauhaus-' + field.type + '>';
                    }
                    html += '</div>';
                    el.replaceWith($compile(html)(scope));
                }
            }

            recompileForm();

            scope.$watch('config', function (newVal, oldVal) {
                if (newVal.fields) {
                    recompileForm();
                }
            });
        }
    };
});

angular.module('bauhaus.document.directives').directive('bauhausRelation', function (DocumentService, $timeout) {
    return {
        restrict: 'AEC',
        template: '<div class="page-content-field" ng-blur="showSelect = false">' +
                  '     <label class="page-content-field-label">{{config.label}}</label>' +
                  '     <div class="tag-list">' +
                  '         <div ng-switch on="multiple">' +
                  '            <div ng-switch-when="false">' +
                  '                <div class="tag" ng-show="value">{{value[useAsLabel]}}<div class="tag-delete" ng-click="removeDoc()"><span class="fa fa-times"></span></div></div>' +
                  '            </div>' +
                  '            <div ng-switch-default>'  +
                  '               <div class="tag" ng-repeat="doc in value">{{doc[useAsLabel]}}<div class="tag-delete" ng-click="removeDoc(doc)"><span class="fa fa-times"></span></div></div>' +
                  '            </div>' +
                  '     </div>' +
                  '     <input class="page-content-field-input input-big" type="text" ng-model="search" placeholder="+ Add {{model}}" ng-focus="showSelect = true" ng-blur="blur($event)"/>' +
                  '     <div class="suggestions" ng-show="showSelect" ng-init="showSelect = false">' +
                  '         <div class="suggestions-item clickable" ng-repeat="doc in documents | filter:search" ng-click="addDoc(doc)">{{doc[useAsLabel]}}</div>' +
                  '     </div>' +
                  '</div>',
        scope: {
            value: '=ngModel',
            config: '=fieldConfig'
        },
        link: function (scope, el, attr) {
            // Load labels of related documents
            scope.useAsLabel = scope.config.options.useAsLabel || 'title';
            scope.multiple = (scope.config.options.multiple !== undefined && typeof scope.config.options.multiple === 'boolean') ? scope.config.options.multiple : true;

            try {
                scope.model = scope.config.options.model;
            } catch (e) {
                function MissingModelName() {
                    this.value = scope.config;
                    this.message = "Missing required option 'model' for widget 'bauhausRelation'";
                }
                throw new MissingModelName;
            }

            scope.blur = function (event) {
                $timeout(function (){
                    scope.showSelect = false;
                }, 200);
            };

            scope.service = DocumentService(scope.config.options.model + 's');
            scope.service.query({select: 'title'}, function (documents) {
                scope.documents = [];
                for (var d in documents) {
                    if (documents[d]._id) {
                        scope.documents.push(documents[d]);
                    }
                }
            });

            scope.addDoc = function (doc) {
                scope.initRelation();
                if (doc._id) {
                    if (scope.multiple === true) {
                        scope.value.push(doc);
                    } else {
                        scope.value = doc;
                    }
                }
                scope.showSelect = false;
            };

            scope.removeDoc = function (doc) {
                if (scope.multiple === true) {
                    var index = scope.value.indexOf( doc );
                    if (index !== -1) {
                        scope.value.splice(index, 1);
                    }
                } else {
                    scope.value.document = null;
                }
            };

            // Init relation object, of it doesn't exist yet
            scope.initRelation = function () {
                if (scope.multiple === true && Array.isArray(scope.value) === false) {
                    scope.value = [];
                }
            };

        }
    };
});
