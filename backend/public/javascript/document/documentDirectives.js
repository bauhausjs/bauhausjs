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