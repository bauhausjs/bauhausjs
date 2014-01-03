
angular.module('bauhaus.page', ['bauhaus.page.controllers']).config(['$routeProvider', function ($routeProvider) {
    'use strict';
    $routeProvider.when('/page', {
        templateUrl: 'javascript/page/pageView.html',
        controller: 'PageCtrl'
    }).when('/page/:id', {
        templateUrl: 'javascript/page/pageView.html',
        controller: 'PageCtrl'
    });
}]);