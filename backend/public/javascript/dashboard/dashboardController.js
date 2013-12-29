angular.module('bauhaus.dashboard.controllers', []);

angular.module('bauhaus.dashboard.controllers').controller('DashboardCtrl', ['$scope', function ($scope) {
    'use strict';
  
    console.log("Dashboard controller called");
    $scope.message = "Welcome to the dashboard"

}]);