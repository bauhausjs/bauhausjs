
angular.module('bauhaus.role', ['bauhaus.role.controllers', 'bauhaus.role.directives']).config(['$routeProvider', function ($routeProvider) {
    'use strict';
    $routeProvider.when('/role', {
        templateUrl: 'javascript/role/roleView.html',
        controller: 'RoleCtrl'
    }).when('/role/:id', {
        templateUrl: 'javascript/role/roleDetailView.html',
        controller: 'RoleDetailCtrl'
    });
}]);