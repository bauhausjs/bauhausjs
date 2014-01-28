
angular.module('bauhaus.document', ['bauhaus.document.controllers', 'bauhaus.document.directives']).config(['$routeProvider', function ($routeProvider) {
    'use strict';

    $routeProvider.when('/document/:type', {
        templateUrl: 'javascript/document/documentListView.html',
        controller: 'DocumentListCtrl'
    }).when('/document/:type/:id', {
        templateUrl: 'javascript/document/documentDetailView.html',
        controller: 'DocumentDetailCtrl'
    });
}]);