angular.module('bauhaus.general.directives', ['bauhaus.general.services']);

angular.module('bauhaus.general.directives').directive('bauhausNavigation', function (SharedDocuments) {
    return {
        restrict: 'EA',
        scope: {},
        templateUrl: 'js/general/navigation.html',
        link: function (scope, el, attr) {
            scope.documents = SharedDocuments.store;
        }
    };
});