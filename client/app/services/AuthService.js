var request = require("superagent")
var LoginActions = require("../actions/LoginActions")

var AuthService = {

    getUser: function() {
        return new Promise((resolve, reject) => {
            request
                .get('/user')
                .set('Accept', 'application/json')
                .end(function(error, res) {
                    error ? reject(error) : resolve(res);
                })
        }).then(function(res) {
            LoginActions.loginUser(res.body);
        })
    },

    login: function(username, password) {
        return new Promise((resolve, reject) => {
            request
                .post('/login')
                .send({ username: username, password: password })
                .set('Accept', 'application/json')
                .end(function(error, res) {
                    error ? reject(error) : resolve(res);
                })
        }).then(function(res) {
            LoginActions.loginUser(res.body);
        })
    },

    twitterAuth: function() {
        // CORS is disabled on the Twitter API :(
        localStorage.setItem('logged_in', user);
        window.location.replace("/auth/twitter");
        // return new Promise((resolve, reject) => {
        //     request
        //         .get('/auth/twitter')
        //         .withCredentials()
        //         // .send({ username: username, password: password })
        //         // .set('Accept', 'application/json')
        //         .end(function(error, res) {
        //             console.log("reached")
        //             console.log(error)
        //             console.log(res)
        //             // console.log(res)
        //             error ? reject(error) : resolve(res);
        //         })
        // }).then(function(res) {
        //     // console.log(res);
        //     LoginActions.loginUser(res.body);
        // })
    },

    logout: function() {
        return new Promise((resolve, reject) => {
            request
                .get('/logout')
                .end(function(error, res) {
                    error ? reject(error) : resolve(res);
                })
        }).then(function(res) {
            LoginActions.logoutUser();
        })   
    }
}

module.exports = AuthService