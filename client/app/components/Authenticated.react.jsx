var React = require('react')
var LoginStore = require("../stores/LoginStore")

function getLoginState() {
    return {
        userLoggedIn: LoginStore.isLoggedIn(),
        user: LoginStore.getUser()
        // jwt: LoginStore.getJwt();
    }
}


var Authenticated = function(ComposedComponent) {
    return React.createClass({

        statics: {
            willTransitionTo: function(transition) {
                // console.log(LoginStore.getUser())
                if (!LoginStore.isLoggedIn()) {
                    transition.redirect('/login');
                }
            }
        },

        getInitialState: function() {
            return getLoginState();
        },

        componentDidMount: function() {
            LoginStore.addChangeListener(this._onChange);
        },

        componentWillUnmount: function() {
            LoginStore.removeChangeListener(this._onChange);
        },

        render: function() {
            return (
            <ComposedComponent
                {...this.props}
                user={this.state.user}
                userLoggedIn={this.state.userLoggedIn} />
            )
        },

        _onChange: function() {
            // console.log(getLoginState());
            this.setState(getLoginState());
        }

    })
} 

module.exports = Authenticated