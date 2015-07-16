/*
    Simple Auth
*/
var passport = require('passport')
var Account = require('./models/account')

module.exports = function(app) {
    app.post('/register', function(req, res) {
        Account.register(new Account({
            username: req.body.username
        }), req.body.password, function(err, account) {
            if (err) {
                return JSON.stringify({
                    error: err.message
                })
            }

            passport.authenticate('local')(req, res, function() {
                // res.redirect('/app');
                res.send(req.user)
            });
        });
    });

    app.post('/login', passport.authenticate('local'), function(req, res) {
        res.send(req.user);
        // res.redirect('/app');
    });

    app.get('/logout', function(req, res) {
        req.logout();
        res.send(200);
        // res.redirect('/');
    });
}