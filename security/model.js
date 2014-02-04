var passportLocalMongoose = require('passport-local-mongoose');

module.exports = function (mongoose) {
    var model = {
        user: {},
        role: {},
        permission: {}
    };

    var Schema = mongoose.Schema;
    

    var user = model.user,
        role = model.role,
        permission = model.permission;

    /* Role */
    role.schema = new Schema({
        name: String,
        permissions: Schema.Types.Mixed
    });

    role.model = mongoose.model('Role', role.schema);

    /* User */
    user.schema = new Schema({
        roles: [Schema.Types.ObjectId],
        public: {
            firstname: String,
            lastname: String
        }
    }, { collection: 'bauhaus-users'} );
    user.schema.plugin(passportLocalMongoose);
    user.model = mongoose.model('User', user.schema);
    
    return model;
}
