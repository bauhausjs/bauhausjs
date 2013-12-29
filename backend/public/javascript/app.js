angular.module('bauhaus', ['ngResource', 'ngRoute', 'bauhaus.dashboard'])
    .config(function ($routeProvider) {
        'use strict';
        $routeProvider.when('/', {redirectTo: '/dashboard'});
});