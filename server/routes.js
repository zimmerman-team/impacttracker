/*
    Simple Auth
*/
var passport = require('passport')
var Account = require('./models/account')

// authentication middleware
function ensureAuthenticated(req, res, next) { if (req.isAuthenticated()) {
        return next();
    }

    res.writeHead(401);
    res.end();
    // res.redirect('/login')
}

module.exports = function(app) {

    // default route
    app.get('/', function(req, res) {
        console.log('called route')
        res.render("index.jade", {
            title: "ImpactTracker",
            user: JSON.stringify(req.user)
        })
    })


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

    app.get('/user', ensureAuthenticated, function(req, res) {
        res.send({user: req.user})
    });


    app.get('/logout', function(req, res) {
        req.logout();
        res.send(200);
        // res.redirect('/');
    });

    // app.get('/isLoggedIn', function(req, res) {
    //     console.log(req.isAuthenticated())
    //     res.send(req.isAuthenticated())
    // })

    app.post('/login', passport.authenticate('local'), function(req, res) {
        res.send(req.user);
        // res.redirect('/app');
    });

    app.get('/auth/twitter', passport.authenticate('twitter'));

    app.get('/auth/twitter/callback',
        passport.authenticate('twitter', {failureRedirect: '/'}),
        function(req, res) {
            console.log('reached')
            // res.send(200)
            res.redirect('/')
        })

}
