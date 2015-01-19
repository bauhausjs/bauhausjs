angular.module('bauhaus.document.directives', []);

angular.module('bauhaus.document.directives').directive('bauhausDocumentForm', function ($compile) {
    return {
        scope: {
            doc: '=ngModel',
            config: '=config'
        },
        link: function (scope, el, attr) {

            function renderField (field, id) {

                var html = '<bauhaus-' + field.type;
                html += ' ng-model="doc.' + field.name  + '" field-config="config.fields[' + id + ']" show-errors="showErrors"';
                if (typeof field.show === 'string') {
                    html += ' ng-show="' + field.show + '"';
                }
                html += '></bauhaus-' + field.type + '>'; 
                return html;
            }

            function recompileForm () {
                if (scope.config && scope.config.fields) {
                    var html ='<div ng-form name="form">';

                    if (scope.config.fieldsets) {
                        // render with fieldsets
                        for (var fs in scope.config.fieldsets) {
                            var fieldset = scope.config.fieldsets[fs];
                            if (fieldset.id)
                            html += '<fieldset';
                            if (typeof fieldset.show === 'string') {
                                html += ' ng-show="' + fieldset.show + '"';
                            }
                            html += '><legend>' + fieldset.legend + '</legend>';

                            for (var f in scope.config.fields) {
                                if (scope.config.fields[f].fieldset === fieldset.id) {
                                    html += renderField( scope.config.fields[f], f )
                                }
                            } 

                            html += '</fieldset>';
                        }

                    } else {
                        // render without fieldset
                        for (var f in scope.config.fields) {
                            html += renderField( scope.config.fields[f], f )
                        }   
                    }
                    
                    html += '</div>';
                   
                    el.replaceWith($compile(html)(scope));
                }


                /*if (scope.config.fields) {
                    var html ='<div>';
                    for (var f in scope.config.fields) {
                        var field = scope.config.fields[f];
                        html += '<bauhaus-' + field.type +
                                ' ng-model="doc.' + field.name  +
                                '" field-config="config.fields[' + f + ']" ></bauhaus-' + field.type + '>';
                    }
                    html += '</div>';
                    el.replaceWith($compile(html)(scope));
                }*/
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
                  '         <span ng-switch on="multiple">' +
                  '            <span ng-switch-when="false">' +
                  '                <div class="tag" ng-show="value">{{value[useAsLabel]}}<div class="tag-delete" ng-click="removeDoc()"><span class="fa fa-times"></span></div></div>' +
                  '            </span>' +
                  '            <span ng-switch-default>'  +
                  '               <div class="tag" ng-repeat="doc in value">{{doc[useAsLabel]}}<div class="tag-delete" ng-click="removeDoc(doc)"><span class="fa fa-times"></span></div></div>' +
                  '            </span>' +
                  '         </span>' +
                  '         <div class="suggestions-wrapper">' + 
                  '             <input class="page-content-field-input input-big" type="text" ng-model="search" placeholder="{{placeholder}}" ng-focus="showSelect = true" ng-blur="blur($event)"/>' +
                  '             <div class="suggestions" ng-show="showSelect" ng-init="showSelect = false">' +
                  '             <div class="suggestions-item clickable" ng-repeat="doc in documents | filter:search" ng-click="addDoc(doc)">{{doc[useAsLabel]}}</div>' +
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
            scope.useAsLabel = scope.config.options.useAsLabel || 'title';
            scope.multiple   = (scope.config.options.multiple !== undefined && typeof scope.config.options.multiple === 'boolean') ? scope.config.options.multiple : true;
            scope.limit      = scope.config.options.limit || 10;

            try {
                scope.model = scope.config.options.model;
            } catch (e) {
                function MissingModelName() {
                    this.value = scope.config;
                    this.message = "Missing required option 'model' for widget 'bauhausRelation'";
                }
                throw new MissingModelName;
            }


            scope.placeholder = scope.config.options.placeholder || "+ Add " + scope.model;
            scope.search    = '';

            scope.blur = function (event) {
                $timeout(function (){
                    scope.showSelect = false;
                }, 200);
            };

            scope.service = DocumentService(scope.config.options.model + 's');

            scope.$watch('search', function (newVal, oldVal) {

                var conditions = '{"' + scope.useAsLabel + '":{"$regex":"' + scope.search + '"}}';
                scope.service.query({select: scope.useAsLabel, limit: scope.limit, conditions: conditions }, function (documents) {
                    scope.documents = [];
                    for (var d in documents) {
                        if (documents[d]._id) {
                            scope.documents.push(documents[d]);
                        }
                    }
                });
            });


            scope.addDoc = function (doc) {
                scope.initRelation();
                if (doc._id) {
                    if (scope.multiple === true) {
                        scope.value.push(doc);
                    } else {
                        scope.value = doc;
                    }
                    scope.search = '';
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
                    scope.value = null;
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

angular.module('bauhaus.document.directives').directive('bauhausEnum', function (DocumentService, $timeout) {
    return {
        restrict: 'AEC',
        template: '<div class="page-content-field">' +
                  '     <label class="page-content-field-label">{{config.label}}</label>' +
                  '     <select ng-model="value" ng-options="name as label for (name, label) in options">' + 
                  '</div>',
        scope: {
            value: '=ngModel',
            config: '=fieldConfig'
        },
        link: function (scope, el, attr) {
            // Load labels of related documents
            scope.options = scope.config.options.enums || {};
        }
    };
});


angular.module('bauhaus.document.directives').directive('bauhausObject', function (DocumentService, $timeout) {
    return {
        restrict: 'AEC',
        template: '<div class="page-content-field">' +
                  '     <label class="page-content-field-label">{{config.label}}</label>' +
                  '     <div ng-repeat="field in value">' + 
                  '         <input type="text" ng-model="field.key" />' +
                  '         <input type="text" ng-model="field.value" />' +
                  '         <button><i class="fa fa-minus" ng-click="remove($index)"></i></button>' + 
                  '     </div>' + 
                  '     <button ng-click="add()"><i class="fa fa-plus"></i> Add</button>' + 
                  '</div>',
        scope: {
            value: '=ngModel',
            config: '=fieldConfig'
        },
        link: function (scope, el, attr) {

            scope.add = function () {
                // set value as array if it is not an array
                if (Array.isArray(scope.value) !== true) {
                    scope.value = [];
                }

                scope.value.push({'key': '', 'value': ''});
            };

            scope.remove = function (index) {
                if (Array.isArray(scope.value)) {
                    scope.value.splice(index, 1);
                }
            };
        }
    };
});

angular.module('bauhaus.document.directives').directive('bauhausOlddate', function (DocumentService, $timeout) {
    return {
        restrict: 'AEC',
        template: '<div class="page-content-field">' +
                  '     <label class="page-content-field-label">{{config.label}}</label>' +
                  '     <select ng-model="date.day" ng-options="n for n in range(1,31)"></select>' + 
                  '     <select ng-model="date.month" ng-options="n for n in range(1,12)"></select>' + 
                  '     <select ng-model="date.year" ng-options="n for n in range(1930,2020)"></select>' + 
                  '</div>',
        scope: {
            value: '=ngModel',
            config: '=fieldConfig'
        },
        link: function (scope, el, attr) {

            scope.date = {
                day: null,
                month: null,
                year: null
            }

            // picks day, month and year from date object for select form
            scope.dateToSelect = function (date) {
                scope.date.day = date.getDate();
                scope.date.month = date.getMonth() + 1;
                scope.date.year = date.getFullYear();
            };

            // creates date object from single select fields
            scope.selectToDate = function (dateObj) {
                // check if all required fields are numbers
                if (typeof dateObj.day === 'number' && typeof dateObj.month === 'number' && typeof dateObj.year === 'number') {
                    var leadingZeroMonth = dateObj.month < 10 ? '0' : '';
                    var leadingZeroDay   = dateObj.day   < 10 ? '0' : '';
                    var date =  dateObj.year + '-' + 
                                leadingZeroMonth + dateObj.month + '-' + 
                                leadingZeroDay + dateObj.day + 'T00:00:00.000Z';

                    scope.value = new Date(date);
                }
            };

            // watch model value and update select on first model update
            scope.$watch('value', function (newVal, oldVal) {
                // ignore all scope.value updates, if scope.date has a value already
                if (typeof newVal === 'string' && scope.date.day === null) {
                    scope.dateToSelect(new Date(newVal));   
                }
            });
            
            // update model on every select update (=update in UI)
            scope.$watch('date', function (newVal) {
                scope.selectToDate(newVal);
            }, true);

            // Load labels of related documents
            scope.range = function (start, end) {
                var list = [];
                for (var i = start; i <= end; i++) {
                    list.push(i);
                }
                return list;
            }
        }
    };
});

