angular.module('bauhaus.page.directives', []);

angular.module('bauhaus.page.directives').filter('toArray', function(){
    return function(obj) {
        var result = [];
        angular.forEach(obj, function(val, key) {
            result.push(val);
        });
        return result;
    };
});

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
angular.module('bauhaus.page.directives').directive('bauhausAddress', function ($compile, $timeout) {
//app.directive('bauhausAddress', function ($compile) {
    return {
        restrict: 'AEC',
        template: '<div class="page-content-field" ng-if="showit">' + 
                  '     <label class="page-content-field-label">{{config.label}} {{config.options.required ? "*" : "" }}</label>' +
                  '     <input class="page-content-field-input input-big" type="text" name="{{config.name}}.street" ng-model="value.street" placeholder="Straße">' + 
                  '     <input class="page-content-field-input input-short" type="text" name="{{config.name}}.streetNo" ng-model="value.streetNo" placeholder="Hausnummer"  ng-disabled="config.permission === \'view\'"/><br />' + 
                  '     <input class="page-content-field-input input-short" type="text" name="{{config.name}}.postcode" ng-model="value.postcode" placeholder="PLZ" ng-disabled="config.permission === \'view\'" />' + 
                  '     <input class="page-content-field-input input-big" type="text" name="{{config.name}}.place" ng-model="value.place" placeholder="Ort"  ng-disabled="config.permission === \'view\'"/>' + 
                  '     <div class="error" ng-show="(validateStreet.$error.required || validateStreetNo.$error.required || validatePostcode.$error.required || validatePlace.$error.required ) && showErrors">Bitte geben Sie eine vollständige Adresse an.</div>' + 
                  '</div>',
        scope: {
            value: '=ngModel',
            config: '=fieldConfig'
        },
        link: function (scope, el, attr) {
            /*$timeout(function(){
            console.log(scope.value.street);
            console.log(scope.value.streetNo);
            console.log(scope.value.postcode);
            console.log(scope.value.place);
            },1000);*/
            scope.$watch('value', function (newVal, oldVal) { 
                if(typeof newVal !== 'object'){
                    scope.value = {'street':'','streetNo':'','postcode':'','place':''};
                }
            });
            scope.showit = true;
            
            
            /*scope.$watch('config.name', function (newVal, oldVal) {
                if (newVal) {
                    scope.value.validateStreet = scope.$parent.form[ scope.config.name + '.street' ];
                    scope.value.validateStreetNo = scope.$parent.form[ scope.config.name + '.streetNo' ];
                    scope.value.validatePostcode = scope.$parent.form[ scope.config.name + '.postcode' ];
                    scope.value.validatePlace = scope.$parent.form[ scope.config.name + '.place' ];
                }
            });*/
            var input = el.find('input');
            if (scope.config && scope.config.options && typeof scope.config.options.required === 'boolean') {
                input.attr('ng-required', true);
            }
            $compile(el.contents())(scope)
        }
    };
});
angular.module('bauhaus.page.directives').directive('bauhausDatetime', function ($timeout) {
    return {
        restrict: 'AEC', //AEC
        template: '<div class="page-content-field">' + 
                  '     <label class="page-content-field-label">{{config.label}}</label>' +
                  '     <!--<input class="page-content-field-input input-big" type="text" ng-value="value" />-->' + 
                  '     <input type="text" ng-value="dateval" id="input1{{config.name}}" ng-if="showdate">' + 
                  '     <input type="time" name="usr_time" ng-model="time" ng-show="showdate">' + 
                  '     <input type="button" value="Datum setzen" ng-if="!showdate" ng-click="setdate()">' + 
                  '     <input type="button" value="Datum entfernen" ng-if="showdate && config.options && config.options.canberemoved" ng-click="unsetdate()">' + 
                  '</div>',
        scope: {
            value: '=ngModel',
            config: '=fieldConfig'
        },
        link: function (scope, el, attr) { 
            
            scope.showdate = false;
            
            scope.load = function(newVal){
                scope.dateval= newVal.substr(0,10);
                scope.time = newVal.substr(11,5);
                scope.showdate = true;

                $timeout(function(){
                    scope.kal = new Kalendae.Input('input1'+scope.config.name, {
                        months:2,
                        format:'YYYY-MM-DD'
                    });
                    scope.kal.subscribe('change', function (date, action) {
                        var temp = date._i+scope.value.substr(10);
                        scope.$apply(function() {
                            scope.value = temp;
                        });
                    });
                },0);
            };
            scope.$watch('value', function (newVal, oldVal) {
                if(newVal && newVal != undefined && typeof newVal !== 'undefined'){ 
                    scope.load(newVal);
                }
            });
            scope.$watch('time', function (newVal, oldVal) {
                if (newVal) {
                    scope.value = scope.value.substr(0,11)+newVal+':00.000Z';
                }
            });
            
            scope.setdate = function(){
                scope.value = new Date().toJSON();
                scope.load(scope.value);
            };
            
            scope.unsetdate = function(){
                scope.showdate = false;
                scope.value = '';
            };
        }
    };
});
angular.module('bauhaus.page.directives').directive('bauhausDate', function ($timeout) {
    return {
        restrict: 'AEC', //AEC
        template: '<div class="page-content-field">' + 
                  '     <label class="page-content-field-label">{{config.label}}</label>' +
                  '     <!--<input class="page-content-field-input input-big" type="text" ng-value="value" />-->' + 
                  '     <input type="text" ng-value="dateval" id="input1{{config.name}}" ng-if="showdate">' + 
                  '     <input type="button" value="Datum setzen" ng-if="!showdate" ng-click="setdate()">' + 
                  '     <input type="button" value="Datum entfernen" ng-if="showdate && config.options && config.options.canberemoved" ng-click="unsetdate()">' + 
                  '</div>',
        scope: {
            value: '=ngModel',
            config: '=fieldConfig'
        },
        link: function (scope, el, attr) { 
            
            scope.showdate = false;
            
            scope.load = function(newVal){
                scope.dateval= newVal.substr(0,10);
                scope.showdate = true;

                $timeout(function(){
                    scope.kal = new Kalendae.Input('input1'+scope.config.name, {
                        months:2,
                        format:'YYYY-MM-DD'
                    });
                    scope.kal.subscribe('change', function (date, action) {
                        var temp = new Date(date).toJSON();
                        scope.$apply(function() {
                            scope.value = temp;
                        });
                    });
                },0);
            };
            scope.$watch('value', function (newVal, oldVal) {
                if(newVal && newVal != null && typeof newVal !== 'undefined'){ 
                    scope.load(newVal);
                }
            });
            
            scope.setdate = function(){
                scope.value = new Date().toJSON();
                scope.load(scope.value);
            };
            
            scope.unsetdate = function(){
                scope.showdate = false;
                scope.value = '';
            };
        }
    };
});

