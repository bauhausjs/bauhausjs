
angular.module('bauhaus.dashboard', ['bauhaus.dashboard.controllers']).config(['$routeProvider', function ($routeProvider) {
    'use strict';
    $routeProvider.when('/dashboard', {
        templateUrl: 'js/dashboard/dashboardView.html',
        controller: 'DashboardCtrl'
    });
}]);