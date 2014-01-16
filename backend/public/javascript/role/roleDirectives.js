angular.module('bauhaus.role.directives', []);

angular.module('bauhaus.role.directives').directive('bauhausRoles', function (SharedRoles) {
    return {
        restrict: 'AEC',
        template: '<div class="page-content-field">' + 
                  '     <label class="page-content-field-label">{{config.label}}</label>' +
                  '     Current Roles: <span ng-repeat="role in value">{{ roles.all[role].name }}</span>' + 
                  '     <select ng-model="newRole" ng-options="id as obj.label for (id, obj) in chooseRole"></select> <button class="button" ng-click="addRole()">Add Role</button>' +
                  '</div>',
        scope: {
            value: '=ngModel',
            config: '=fieldConfig'
        }, 
        link: function (scope, el, attr) {

            scope.chooseRole = {};
            scope.roles = SharedRoles.store;

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

            scope.updateRoleList();

            scope.addRole = function () {
                if (scope.newRole && scope.value.indexOf( scope.newRole ) === -1) {
                    scope.value.push(scope.newRole);
                    scope.newRole = null;
                    scope.chooseRole = scope.getRoles();
                }
            };

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
        }
    };
});