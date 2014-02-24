angular.module('bauhaus.user.controllers', ['bauhaus.user.services']);

angular.module('bauhaus.user.controllers').controller('UserCtrl', ['$scope', '$location', 'User',  function ($scope, $location, User) {
    'use strict';

    $scope.users = [];

    User.query({}, function (result) {
        var users = [];
        for (var u in result) {
            if (result[u]._id) {
                users.push(result[u]);
            }
        }

        $scope.users = users;
    });

    $scope.createUser = function () {
        $location.path('user/new')
    }

}]);

angular.module('bauhaus.user.controllers').controller('UserDetailCtrl', ['$scope', '$location', '$routeParams', 'User', 'SharedRoles', 'SharedCustomUserFields', function ($scope, $location, $routeParams, User, SharedRoles, SharedCustomUserFields) {
    'use strict';

    $scope.user = null;
    $scope.userId = null;
    $scope.roles = SharedRoles.store;
    $scope.customUserFields = SharedCustomUserFields.store;

    if ($routeParams.id && $routeParams.id != 'new') {
        $scope.userId = $routeParams.id;
        // load user data for passed id
        User.get({ userId: $scope.userId }, function (result) {
            if (result && result._id) {
                $scope.user = result;

                /* Remove unreferenced roles from user */
                for (var r in $scope.user.roles) {
                    var roleId = $scope.user.roles[r];
                    if (Object.keys($scope.roles.all).length >= 1 && !$scope.roles.all[ roleId ]) {
                        $scope.user.roles.splice(r, 1);
                    }
                }
            }
        });
    } else {
        $scope.user = {};
    } 

    $scope.isNew = function () {
        return ($scope.user && $scope.user._id) ? false : true;
    };

    $scope.updateUser = function () {
        // Save user if it already has an _id
        if ($scope.user._id) {
            User.put($scope.user, function (result) {
                $scope.user.password = '';
            });
        } else {
            // create new user
            User.create({}, function (result) {
                console.log("Created user", result);
                $scope.user._id = result._id;
                $scope.userId =   result._id;

                User.put($scope.user, function (result) {
                    $scope.user.password = '';
                });
            })
        }
    };

    $scope.deleteUser = function () {
        var ok = confirm('Are you sure you want to delete User "' + $scope.user.username + '"');
        if (ok) {
            User.delete({}, {_id: $scope.user._id }, function (result) {
                $location.path('user');
            });
        }
    }

    
}]);