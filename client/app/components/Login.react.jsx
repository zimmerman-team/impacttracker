var React = require('react');
var AuthService = require('../services/AuthService');
var Input = require('react-bootstrap').Input;
var ButtonInput = require('react-bootstrap').ButtonInput;

var Login = React.createClass({
    getInitialState: function() {
        return {
            user: "",
            password: ""
        };
    },

    login: function(e) {
        // e.preventDefault();

        var username = (this.refs.username).getInputDOMNode().value.trim();
        var password = (this.refs.password).getInputDOMNode().value.trim();

        AuthService.login(username, password)
            .catch(function(error) {
                console.log("error logging in", error)
            })

        // AuthService.twitterAuth();
    },

    render: function() {
        return (
        <div>
            <nav id="navi" className="navbar navbar-inverse">
            <div className="container">
              {/* Brand and toggle get grouped for better mobile display */}
              <div className="navbar-header">
                <button type="button" className="navbar-toggle collapsed" data-toggle="collapse" data-target="#nav-collapse" aria-expanded="false">
                  <span className="sr-only">Toggle navigation</span>
                  <span className="icon-bar" />
                  <span className="icon-bar" />
                  <span className="icon-bar" />
                </button>
                <a className="navbar-brand" href="/frontpage.html">
                  <span><span class="glyphicon glyphicon-screenshot" aria-hidden="true"></span> Impact Tracker</span>
                </a>
              </div>
              {/* Collect the nav links, forms, and other content for toggling */}
              <div className="collapse navbar-collapse " id="nav-collapse">
                <ul className="nav navbar-nav">
                  <li><a href="/frontpage.html#signup">Sign up</a></li>
                  <li><a href="/frontpage.html#about">About</a></li>
                  <li><a href="/frontpage.html#contact">Contact</a></li>
                </ul>
                <ul className="nav navbar-nav navbar-right">
                  <li className="active"><a href="/#/login">Log in</a></li>
                </ul>
              </div>{/* /.navbar-collapse */}
            </div>{/* /.container-fluid */}
          </nav>
          <div className="container login middle">
            <div className="row">
              <div className="col-lg-4 col-lg-offset-4">
                <div className="panel panel-default">
                  <h1>Log in</h1>
                  <form onsubmit="{this.login}">
                    <Input type="text" defaultValue="test" ref="username" placeholder="Username" />
                    <Input type="password" defaultValue="test" ref="password" placeholder="Password" />
                    <ButtonInput type='submit' bsStyle="primary" defaultValue="Log in" />
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>

        );
    },


    componentDidMount: function() {
        this.login()
    }

})

module.exports = Login