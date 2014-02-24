angular.module('bauhaus.user', ['bauhaus.user.controllers', 'bauhaus.user.directives']).config(['$routeProvider', function ($routeProvider) {
    'use strict';
    $routeProvider.when('/user', {
        templateUrl: 'user/userView.html',
        controller: 'UserCtrl'
    }).when('/user/:id', {
        templateUrl: 'user/userDetailView.html',
        controller: 'UserDetailCtrl'
    });
}]);