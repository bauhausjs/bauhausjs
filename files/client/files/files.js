
angular.module('bauhaus.files', ['bauhaus.files.controllers']).config(['$routeProvider', function ($routeProvider) {
    'use strict';
    $routeProvider.when('/files', {
        templateUrl: 'files/filesView.html',
        controller: 'filesController'
    }).when('/files/:id', {
        templateUrl: 'files/filesTree.html',
        controller: 'filesController'
    });
}]);