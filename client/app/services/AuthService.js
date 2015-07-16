var request = require("superagent")
var LoginActions = require("../actions/LoginActions")

var AuthService = {
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

    logout: function() {

    }
}

module.exports = AuthService