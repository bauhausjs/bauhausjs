angular.module('bauhaus.page.directives', []);

angular.module('bauhaus.page.directives').directive('preventDefault', function() {
    return function(scope, element, attrs) {
        angular.element(element).on('click', function (event) {
            event.preventDefault();   
            event.stopPropagation();         
        });
    };
});

angular.module('bauhaus.page.directives').directive('bauhausForm', function ($compile) {
    return {
        scope: {
            content: '=ngModel',
            config: '=config'
        },
        link: function (scope, el, attr) {
            var html ='<div>';
            for (var f in scope.config.fields) {
                var field = scope.config.fields[f];
                html += '<bauhaus-' + field.type + 
                        ' ng-model="content.content.' + field.name  + 
                        '" field-config="config.fields[' + f + ']" ></bauhaus-' + field.type + '>';
            }
            html += '</div>';

            el.replaceWith($compile(html)(scope));
        }
    };
});

angular.module('bauhaus.page.directives').directive('bauhausPageTree', function (SharedPageTree, Page, $location) {
    return {
        templateUrl: 'page/pageTree.html',
        scope: {},
        link: function (scope, el, attr) {
            scope.tree = SharedPageTree.tree;

            scope.changePage = function (id) {
                $location.path('page/' + id);
            };

            /* Create new child page at rest service, called from UI */
            scope.newPage = function (page) {
                var seperator = (page.route[ page.route.length - 1 ] === '/') ? '' : '/';

                var newPage = {
                    parentId: page._id,
                    title: '',
                    route: page.route + seperator,
                    _type: page._type,
                    public: false
                };

                Page.create(newPage, function (result) {
                    if (!page.children) page.children = {};
                    page.children[ result._id ] = result;
                    scope.changePage(result._id);
                });
            };
        }
    };
});

angular.module('bauhaus.page.directives').directive('bauhausText', function () {
    return {
        restrict: 'AEC',
        template: '<div class="page-content-field">' + 
                  '     <label class="page-content-field-label">{{config.label}}</label>' +
                  '     <input class="page-content-field-input input-big" type="text" ng-model="value" />' + 
                  '</div>',
        scope: {
            value: '=ngModel',
            config: '=fieldConfig'
        }
    };
});

angular.module('bauhaus.page.directives').directive('bauhausCheckbox', function () {
    return {
        restrict: 'AEC',
        template: '<div class="page-content-field">' + 
                  '     <label class="page-content-field-label">{{config.label}}</label>' +
                  '     <input class="page-content-field-checkbox" type="checkbox" ng-model="value" />' + 
                  '</div>',
        scope: {
            value: '=ngModel',
            config: '=fieldConfig'
        }
    };
});

angular.module('bauhaus.page.directives').directive('bauhausPassword', function () {
    return {
        restrict: 'AEC',
        template: '<div class="page-content-field">' + 
                  '     <label class="page-content-field-label">{{config.label}}</label>' +
                  '     <input class="page-content-field-input input-big" type="password" ng-model="value" />' + 
                  '</div>',
        scope: {
            value: '=ngModel',
            config: '=fieldConfig'
        }
    };
});

angular.module('bauhaus.page.directives').directive('bauhausTextarea', function () {
    return {
        restrict: 'AEC',
        template: '<div class="page-content-field">' + 
                  '     <label class="page-content-field-label">{{config.label}}</label>' +
                  '     <textarea class="page-content-field-textarea" ng-model="value"></textarea>' + 
                  '</div>',

        scope: {
            value: '=ngModel',
            config: '=fieldConfig'
        }
    };
});

angular.module('bauhaus.page.directives').directive('bauhausHtml', function () {
    return {
        restrict: 'AEC',
        template: '<div class="page-content-field">' + 
                  '     <label class="page-content-field-label">{{config.label}}</label>' +
                  '     <div text-angular ta-toolbar="[ [\'p\',\'h1\',\'h2\',\'h3\'], [\'bold\',\'italics\',\'ul\',\'ol\',\'redo\',\'undo\'], [\'html\'] ]" ng-model="value"></div>' + 
                  '</div>',

        scope: {
            value: '=ngModel',
            config: '=fieldConfig'
        }
    };
});
