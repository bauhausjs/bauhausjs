angular.module('bauhaus', ['ngResource', 'ngRoute', 'slugifier', 'bauhaus.general', 'bauhaus.dashboard', 'bauhaus.document', 'bauhaus.page', 'bauhaus.user', 'bauhaus.role'])
    .config(function ($routeProvider) {
        'use strict';
        $routeProvider.when('/', {redirectTo: '/dashboard'});
});