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

        var username = React.findDOMNode(this.refs.username).value.trim();
        var password = React.findDOMNode(this.refs.password).value.trim();

        AuthService.login(username, password)
            .catch(function(error) {
                console.log("error logging in", error)
            })
    },

    render: function() {
        return (
        // <form role="form" onSubmit={this.login}>
        //     <div className="form-group">
        //         <input type="text" placeholder="Username" ref="username" value="test"/>
        //         <input type="password" placeholder="Password" ref="password" value="test"/>
        //         <input type="submit" value="Post" />
        //     </div>
        // </form>
          <section className="login">
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
          </section>

        );
    },
    
//     <script src="bower_components/jquery/dist/jquery.min.js"></script>
//     <script src="bower_components/foundation/js/foundation.min.js"></script>
//     <script src="js/app.js"></script>
//   </body>
// </html>


    componentDidMount: function() {
        this.login()
    }

})

module.exports = Login