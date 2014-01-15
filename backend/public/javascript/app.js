angular.module('bauhaus', ['ngResource', 'ngRoute', 'bauhaus.dashboard', 'bauhaus.page', 'bauhaus.user'])
    .config(function ($routeProvider) {
        'use strict';
        $routeProvider.when('/', {redirectTo: '/dashboard'});
});