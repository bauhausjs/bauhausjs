angular.module('bauhaus.role.directives', []);

angular.module('bauhaus.role.directives').directive('bauhausRoles', function (SharedRoles) {
    return {
        restrict: 'AEC',
        template: '<div class="page-content-field">' + 
                  '     <label class="page-content-field-label">{{config.label}}</label>' +
                  '     <div class="tag-list"><div class="tag" ng-repeat="role in value"><i class="fa fa-group"></i> {{ roles.all[role].name }} <div class="tag-delete" ng-click="removeRole(role)"><span class="fa fa-times"></span></div></div></div>' + 
                  '     <div class="page-content-field-control"><select ng-model="newRole" ng-options="id as obj.name for (id, obj) in chooseRole"></select> <button class="button" ng-click="addRole()">Add Role</button></div>' +
                  '</div>',
        scope: {
            value: '=ngModel',
            config: '=fieldConfig'
        }, 
        link: function (scope, el, attr) {

            scope.chooseRole = {};
            scope.roles = SharedRoles.store;

            scope.getRoles = function () {
                var roles = {};
                for (var id in scope.roles.all) {
                    var role = scope.roles.all[id];

                    if (scope.value && scope.value.indexOf( id ) === -1) {
                        if (scope.newRole == null) {
                            scope.newRole = id;
                        }
                        roles[id] = role;
                    }
                }
                return roles;
            };

            scope.updateRoleList = function () {
                if (scope.roles && scope.roles.all && typeof scope.roles.all === 'object' && Object.keys(scope.roles.all).length > 0) {
                    scope.chooseRole = scope.getRoles();
                }
            };

            scope.$watch('roles.all', function (newVal) {
                scope.updateRoleList();
            }, true);

            scope.$watch('value', function (newVal) {
                scope.updateRoleList();
            }, true);

            scope.removeRole = function (role) {
                var index = scope.value.indexOf( role );
                if (index !== -1) {
                    scope.value.splice(index, 1);
                }
            };

            scope.updateRoleList();

            scope.addRole = function () {
                if (scope.newRole && scope.value.indexOf( scope.newRole ) === -1) {
                    scope.value.push(scope.newRole);
                    scope.newRole = null;
                    scope.chooseRole = scope.getRoles();
                }
            };

            
        }
    };
});

angular.module('bauhaus.role.directives').directive('bauhausPermissions', function (SharedPermissions) {
    return {
        restrict: 'AEC',
        template: '<div class="form-field">' + 
                  '     <label class="page-content-field-label">{{config.label}}</label>' +
                  '     <div class="checkbox-group" ng-repeat="(name, service) in permissions.all">' + 
                  '         <div class="checkbox-group-title">{{name}}</div>' + 
                  '         <div class="checkbox-group-element" ng-repeat="permission in service">' + 
                  '             <input type="checkbox" ng-model="value[name + \':\' + permission]" id="{{ name + \':\' + permission }}">' + 
                  '             <label for="{{ name + \':\' + permission }}" ng-class="{ active: value[name + \':\' + permission] === true }">{{permission}}</label>' +
                  '         <div>' +  
                  '     </div>' + 
                  '</div>',
        scope: {
            value: '=rolePermissions',
            config: '=config'
        }, 
        controller: function ($scope) {
            $scope.permissions = SharedPermissions.store;
            $scope.$watchCollection('value', function (newVal) {
                // permission updated
            }), true;
        }
    };
});