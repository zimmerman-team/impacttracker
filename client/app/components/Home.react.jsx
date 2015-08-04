var React = require('react')
var Router = require('react-router');
var socketio = require("socket.io-client");

var Authenticated = require("./Authenticated.react.jsx");
var ApiService = require("../services/ApiService.js");
var AuthService = require('../services/AuthService');

var Navbar = require('react-bootstrap').Navbar;
var Nav = require('react-bootstrap').Nav;
var NavItem = require('react-bootstrap').NavItem;
var DropdownButton = require('react-bootstrap').DropdownButton;
var MenuItem = require('react-bootstrap').MenuItem;
var Glyphicon = require('react-bootstrap').Glyphicon;

var RouterContainer = require('../util/RouterContainer')

var Home = Authenticated(React.createClass({
    componentWillMount: function() {
        ApiService.init(socketio());
    },

    // listen: function() {

    //     this.socket.on('new-node', console.log)
    //     this.socket.on('new-link', console.log)

    //     this.socket.emit("Source.create", {
    //         screen_name: "PeterTatchell",
    //         user_id: 31135856
    //     }, (error, source) => {

    //         this.socket.emit("Target.create", {
    //             screen_name: "ggreenwald",
    //             user_id: 16076032
    //         }, (error, target) => {
    //             var campaign = {
    //                 name: "new campaign",
    //                 // sources: [
    //                 //     { screen_name: "hrw" }
    //                 // ],
    //                 // targets: [
    //                 //     { screen_name: "noradio" }
    //                 // ],
    //                 sources: [source._id],
    //                 targets: [target._id],

    //                 handle: "hrw",
    //                 description: "description"
    //             }

    //             this.socket.emit('Campaign.create', campaign, function(error, data) {
    //                 console.log(data);
    //             });
            
    //         });
    //     })
    // },

    _onLogoutClick: function() {
        AuthService.logout();
    },

    render: function() {
        return (
            <div class="project">
              <Navbar inverse>
                <a className="navbar-brand">
                    <span><Glyphicon glyph='screenshot' /> Impact Tracker</span>
                </a>
                <Nav navbar>
                  <NavItem eventKey={2} href='#/home/campaign'><Glyphicon glyph='th-large' /> Campaigns</NavItem>
                  <NavItem style={{display: "none"}} eventKey={3} href='#/home'><Glyphicon glyph='user' /> User profile</NavItem>
                  <NavItem style={{display: "none"}} eventKey={4} href='#/home'><Glyphicon glyph='info-sign' /> Support</NavItem>
                </Nav>
                <Nav navbar right>
                  <NavItem eventKey={5} onClick={this._onLogoutClick}><Glyphicon glyph='lock' /> Log out</NavItem>
                </Nav>
              </Navbar>

            <Router.RouteHandler/>
            </div>
        )
    }
}))

module.exports = Home;