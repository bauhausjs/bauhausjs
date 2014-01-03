angular.module('bauhaus', ['ngResource', 'ngRoute', 'bauhaus.dashboard', 'bauhaus.page'])
    .config(function ($routeProvider) {
        'use strict';
        $routeProvider.when('/', {redirectTo: '/dashboard'});
});