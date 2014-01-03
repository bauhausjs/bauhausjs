angular.module('bauhaus.page.controllers', ['bauhaus.page.services']);

angular.module('bauhaus.page.controllers').controller('PageCtrl', ['$scope', '$routeParams', 'Page', 'PageTree', function ($scope, $routeParams, Page, PageTree) {
    'use strict';

    $scope.message = "Welcome to the page";
    $scope.currentPageId = $routeParams.id;

    $scope.hasChildren = function (page) {
        return page.children && Object.keys(page.children).length > 0 ? true : false;
    }

    $scope.changePage = function (id) {
        $scope.currentPageId = id;
    };

    $scope.$watch('currentPageId', function (newVal, oldVal) {
        if (newVal) {
            Page.get({ pageId: newVal }, function (result) {
                $scope.page = result;
            });
        }
    });
    
    PageTree.get(function (result) {
        $scope.tree = result.tree;
        // Set current id if /page was called without id
        if (!$scope.currentId) {
            for (var rootKey in $scope.tree) {
                $scope.currentPageId = rootKey;
            }
        }
    });

}]);