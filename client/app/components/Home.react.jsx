var React = require('react')
var Router = require('react-router');
var socketio = require("socket.io-client");

var Authenticated = require("./Authenticated.react.jsx");
var ApiService = require("../services/ApiService.js");

var Navbar = require('react-bootstrap').Navbar;
var Nav = require('react-bootstrap').Nav;
var NavItem = require('react-bootstrap').NavItem;
var DropdownButton = require('react-bootstrap').DropdownButton;
var MenuItem = require('react-bootstrap').MenuItem;

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

    render: function() {
        return (
            <div class="project">
              <Navbar brand='Impact Tracker'>
                <Nav>
                  <NavItem eventKey={1} href='#/home'>Home</NavItem>
                  <NavItem eventKey={2} href='#/home/campaign'>Campaigns</NavItem>
                  <DropdownButton eventKey={3} title='Dropdown'>
                    <MenuItem eventKey='1'>Action</MenuItem>
                    <MenuItem eventKey='2'>Another action</MenuItem>
                    <MenuItem eventKey='3'>Something else here</MenuItem>
                    <MenuItem divider />
                    <MenuItem eventKey='4'>Separated link</MenuItem>
                  </DropdownButton>
                </Nav>
              </Navbar>

            <Router.RouteHandler/>
            </div>
        )
    }
}))

module.exports = Home;