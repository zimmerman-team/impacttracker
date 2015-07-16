var React = require('react');
var AuthService = require('../services/AuthService')

var Login = React.createClass({
    getInitialState: function() {
        return {
            user: "",
            password: ""
        };
    },

    login: function(e) {
        // e.preventDefault();

        var username = React.findDOMNode(this.refs.username).value.trim();
        var password = React.findDOMNode(this.refs.password).value.trim();

        AuthService.login(username, password)
            .catch(function(error) {
                console.log("error logging in", error)
            })
    },

    render: function() {
        return (
        <form role="form" onSubmit={this.login}>
            <div className="form-group">
                <input type="text" placeholder="Username" ref="username" value="test"/>
                <input type="password" placeholder="Password" ref="password" value="test"/>
                <input type="submit" value="Post" />
            </div>
        </form>
        );
    },

    componentDidMount: function() {
        this.login()
    }

})

module.exports = Login