
module.exports = function (bauhausConfig) {
    bauhausConfig.addDocument('Users', {
        name: 'User',
        model: 'User',
        collection: 'users',
        icon: 'user',
        query: {},
        useAsLabel: 'username',
        fields: [
            { 
                name: 'username',
                type: 'text',
                label: 'Username' 
            }, {
                name: 'password',
                type: 'password',
                label: 'Set new password'
            }, {
                name: 'roles',
                type: 'roles',
                label: 'Roles'
            }
        ]
    });

    bauhausConfig.addDocument('Roles', {
        name: 'Role',
        model: 'Role',
        collection: 'roles',
        icon: 'group',
        query: {},
        useAsLabel: 'name',
        fields: [
            { 
                name: 'name',
                type: 'text',
                label: 'Name' 
            }, {
                name: 'permissions',
                type: 'permissions',
                label: 'Permissions'
            }
        ]
    });
}