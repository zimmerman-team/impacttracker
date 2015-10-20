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

    // helper function for determining logged in or not
    // TODO: remove this, should be unnescessary
    // isLoggedIn: function(cb) {
    //     return new Promise((resolve, reject) => {
    //         request
    //             .get('/isLoggedIn')
    //             // .set('Accept', 'application/json')
    //             .end(function(error, res) {
    //                 error ? reject(error) : resolve(res);
    //             })
    //     }).then(function(res) {
    //         cb(res.body)
    //     })
    // },

    twitterAuth: function() {
        // CORS is disabled on the Twitter API :( must redirect, check for cookie on return
        // TODO: change this to a proper scheme for SPA

        window.location = "/auth/twitter";

        // localStorage.setItem('logged_in', user);
        // return new Promise((resolve, reject) => {
        //     request
        //         .get('/auth/twitter')
        //         .withCredentials()
        //         // .send({ username: username, password: password })
        //         // .set('Accept', 'application/json')
        //         .end(function(error, res) {
        //             error ? reject(error) : resolve(res);
        //         })
        // }).then(function(res) {
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
