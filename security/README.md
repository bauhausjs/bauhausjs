# Bauhaus security

The security plugin allows to manage user, roles and permissions. 

It also provides middleware for authentification and authorization. Authentification is using [Passport](http://passportjs.org/) middleware. Sessions are persisted in MongoDB. 

Authorization is role and permission based. Plugins can add permissions, e.g. 'post:edit', at `security.addPermission()`. For each role can be defined if it has that permission or not. Users can have multiple roles. The middleware `security.middleware.loadRoles()` add all roles and their permissions to `req.session.user`, you can access in your middleware. Protect your routes and middleware by adding the middleware `security.middleware.hasPermission(['post:edit'])`.

Session middleware, login and logout functionality is configured for each application plugin (`backend` and `frontend`).

## Options

* **sessionSecret** `String`: Shared session secret, which is used to encrypt session

## API

### security.addPermission(pluginName, permissions)

* **pluginName** `String`: Name of registering plugin, e.g. 'post'
* **permission** `Array.<String>`: Array of permission keys, e.g. ['show', 'edit']

All permissions you add can be configured in the backend for each role. 

### security.addCustomUserField(field)

* **field** `Array.<Objects> || Object`: Configuration for one or multiple fields

Add custom user fields to user object. Make sure that `name`, which equals the field path
in the user objects starts with `public.`, because `User.public` is an object which can 
be extended.

Example:
```javascript
security.addCustomUserField([
    { name: 'public.email', 
      type: 'text',
      label: 'E-Mail' }, 
    { name: 'public.firstname', 
      type: 'text',
      label: 'First name' }, 
    { name: 'public.lastname', 
      type: 'text',
      label: 'Last name' }
]);
```

### security.middleware.loadRoles

Type: `Function`, Express middleware

Middleware adds roles and permissions of current user to request at `req.session.user`.

```javascript
console.log(req.session.user);
{
    "username": "oskars",
    "roles": ["Painter"],
    "permissions": ["painting:draw", "painting:clear"]
}
```

### security.middleware.isAuthenticated({redirect: redirectUrl})

Type: `Function`

* **redirectUrl** `String`: URL were user is redirected to if not authenticated

* **returns** `Function`: Express middleware

Express middleware checks if user is authenticated. If user is authenticated `next()` is called. Otherwise, for JSON requests error `403` is returned, other requests are redirected.

### security.middleware.hasPermission(permissions)

Type: `Function`

* **permissions** `Array.<Strings> || String`: Permissions in format 'PLUGIN:PERMISSION', e.g. 'post:edit'

* **returns** `Function`: Express middleware

Middleware checks if user has all given permissions and calls `next()` if true. Otherwise, for JSON requests error `403` is returned, other requests are redirected.

### security.passport

Type: `Object` Passport instance

Configured passport instance, which provides middleware to add authorization middleware to express apps.

## REST API

The JSON REST service is currently generated with baucis and provides the following methods:

```
GET    /backend/api/CurrentUser    Return name, roles and permissions of current user

GET    /backend/api/permissions    Return all registered permissions (`security.permissions`)

GET    /backend/api/Users        
POST   /backend/api/Users
GET    /backend/api/Users/:id
PUT    /backend/api/Users/:id
DELETE /backend/api/Users/:id

GET    /backend/api/Roles       
POST   /backend/api/Roles
GET    /backend/api/Roles/:id
PUT    /backend/api/Roles/:id
DELETE /backend/api/Roles/:id
```

## Model: User

var user = new mongoose.Schema({
    roles: [Schema.Types.ObjectId],     // Array of references to role
    public: {}                          // Object to define custom fields
});

## Model: Role

var role = new mongoose.Schema({
    name: String,                       
    permissions: Schema.Types.Mixed     // Array of Strings of permissions (e.g. 'post:edit') this role has
});

