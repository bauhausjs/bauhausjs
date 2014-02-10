angular.module('bauhaus.user.directives', []);

angular.module('bauhaus.user.directives').directive('bauhausUserForm', function ($compile) {
    return {
        scope: {
            content: '=ngModel',
            config: '=config'
        },
        link: function (scope, el, attr) {

            function renderForm () {
                var html ='<div>';
                for (var f in scope.config.fields) {
                    var field = scope.config.fields[f];
                    html += '<bauhaus-' + field.type + 
                            ' ng-model="content.' + field.name  + 
                            '" field-config="config.fields[' + f + ']" ></bauhaus-' + field.type + '>';
                }
                html += '</div>';
                
                el.empty();
                el.append($compile(html)(scope));
            }

            renderForm();
            // Re-render form if fields change
            // This happens because config for custom field is loaded async and might not be available on first render
            scope.$watchCollection('config.fields', function (newVal, oldVal) {
                if (newVal && newVal.length > 1) {
                    renderForm();
                }
            });
        }
    };
});