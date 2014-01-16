angular.module('bauhaus', ['ngResource', 'ngRoute', 'bauhaus.dashboard', 'bauhaus.page', 'bauhaus.user', 'bauhaus.role'])
    .config(function ($routeProvider) {
        'use strict';
        $routeProvider.when('/', {redirectTo: '/dashboard'});
});