
angular.module('bauhaus.document', ['bauhaus.document.controllers', 'bauhaus.document.directives']).config(['$routeProvider', function ($routeProvider) {
    'use strict';

    $routeProvider.when('/document/:type', {
        templateUrl: 'document/documentListView.html',
        controller: 'DocumentListCtrl'
    }).when('/document/:type/:id', {
        templateUrl: 'document/documentDetailView.html',
        controller: 'DocumentDetailCtrl'
    });
}]);