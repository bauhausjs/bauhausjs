
angular.module('bauhaus.page', ['bauhaus.page.controllers', 'bauhaus.page.directives']).config(['$routeProvider', function ($routeProvider) {
    'use strict';
    $routeProvider.when('/page', {
        templateUrl: 'page/pageView.html',
        controller: 'PageCtrl'
    }).when('/page/:id', {
        templateUrl: 'page/pageView.html',
        controller: 'PageCtrl'
    });
}]);