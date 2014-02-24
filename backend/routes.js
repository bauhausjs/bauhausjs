var flash = require('connect-flash'),
    securityMiddleware = require('../security/middleware');

module.exports = function (app, templateDir) {
    var isAuthenticated = securityMiddleware.isAuthenticated({redirect:'/backend/login'});
    var hasPermission   = securityMiddleware.hasPermission;

    // update install before requesting permissions
    // hasPermission(['backend:login'], {redirect:'/backend/login'})
    app.get('/', [isAuthenticated], function (req, res) {
        res.render(templateDir + '/index.ejs', { env: process.env.NODE_ENV, username: req.user.username });
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