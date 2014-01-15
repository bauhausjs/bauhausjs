angular.module('bauhaus.user.directives', []);

angular.module('bauhaus.user.directives').directive('bauhausDocumentForm', function ($compile) {
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
                        ' ng-model="content.' + field.name  + 
                        '" field-config="config.fields[' + f + ']" ></bauhaus-' + field.type + '>';
            }
            html += '</div>';
            
            el.replaceWith($compile(html)(scope));
        }
    };
});