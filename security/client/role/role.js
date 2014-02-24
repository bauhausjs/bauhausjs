
angular.module('bauhaus.role', ['bauhaus.role.controllers', 'bauhaus.role.directives']).config(['$routeProvider', function ($routeProvider) {
    'use strict';
    $routeProvider.when('/role', {
        templateUrl: 'role/roleView.html',
        controller: 'RoleCtrl'
    }).when('/role/:id', {
        templateUrl: 'role/roleDetailView.html',
        controller: 'RoleDetailCtrl'
    });
}]);