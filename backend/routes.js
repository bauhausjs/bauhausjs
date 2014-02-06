var flash = require('connect-flash');

module.exports = function (app, security) {
    var isAuthenticated = security.middleware.isAuthenticated({redirect:'/backend/login'});
    var hasPermission   = security.middleware.hasPermission;

    // update install before requesting permissions
    // hasPermission(['backend:login'], {redirect:'/backend/login'})
    app.get('/', [isAuthenticated], function (req, res) {
        res.render(__dirname + '/build/templates/index.ejs', { env: process.env.NODE_ENV, username: req.user.username });
    });

    // Login Form
    app.get('/login', function (req, res) {
        if (req.user) return res.redirect('/backend/');

        res.render(__dirname + '/templates/login.ejs', { error: req.flash('error'), info: req.flash('info') });
    });

    // Logout request
    app.get('/logout', function (req, res) {
        flash('info','Logged out');
        req.logout();
        req.session.user = null;
        res.redirect('/backend/login');
    });
}