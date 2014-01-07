angular.module('bauhaus.page.directives', []);

angular.module('bauhaus.page.directives').directive('preventDefault', function() {
    return function(scope, element, attrs) {
        angular.element(element).on('click', function (event) {
            event.preventDefault();   
            event.stopPropagation();         
        });
    };
})