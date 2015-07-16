var React = require('react')
var Authenticated = require("./Authenticated.react.jsx");

var Home = Authenticated(React.createClass({
    render: function() {
        return (<h1>Hello {this.props.user.username}</h1>)
    }
}))

module.exports = Home;