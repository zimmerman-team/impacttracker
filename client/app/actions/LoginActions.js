var AppDispatcher = require('../dispatcher/AppDispatcher')
var AuthConstants = require('../constants/AuthConstants')
var RouterContainer = require('../util/RouterContainer')

var LoginActions = {
    loginUser: function(user) {
        RouterContainer.get().transitionTo('/home/campaign');

        // localStorage.setItem('logged_in', true)
        localStorage.setItem('logged_in', user)

        AppDispatcher.dispatch({
            actionType: AuthConstants.LOGIN_USER,
            user: user
        })
    }
}

module.exports = LoginActions