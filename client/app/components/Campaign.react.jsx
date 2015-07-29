var React = require('react')
var Router = require('react-router');
var _ = require('lodash')
var Authenticated = require("./Authenticated.react.jsx");
var CampaignStore = require("../stores/CampaignStore")

var Table = require('react-bootstrap').Table;
var SplitButton = require('react-bootstrap').SplitButton;
var MenuItem = require('react-bootstrap').MenuItem;
var Button = require('react-bootstrap').Button;
var Glyphicon = require('react-bootstrap').Glyphicon;
var Input = require('react-bootstrap').Input;


var RouterContainer = require('../util/RouterContainer')

function getCampaignState() {
    return {
        campaigns: CampaignStore.getAll()
    }
}

var Campaign = React.createClass({

    getInitialState: function() {
        return getCampaignState();
    },

    render: function() {

        return (
            <div className="container campaignview">
                <div className="row">
                    <div className="col-lg-4">
                       <Button className="new-campaign" onClick={RouterContainer.get().transitionTo.bind(null, "/home/campaign/new")} bsStyle="primary" bsSize="large"><Glyphicon glyph='plus' /> New campaign</Button>
                    </div>
                    <div className="col-lg-6">
                        <span className="toggle-tag">Toggle visible campaigns</span>
                        <a id="toggle-planned" className="legend planned">Planned</a>
                        <a id="toggle-running" className="legend running disabled">Started</a>
                        <a id="toggle-completed" className="legend completed">Completed</a>
                    </div>
                    <div className="col-lg-2">
                        <Input type='select' placeholder='Sort by...'>
                          <option value='date'>Date</option>
                          <option value='other'>...</option>
                        </Input>
                    </div>
                </div>
                <CampaignTable campaigns={this.state.campaigns}/>
            </div>
        )
    },

    componentDidMount: function() {
        CampaignStore.addChangeListener(this._onChange);
    },

    componentWillUnmount: function() {
        CampaignStore.removeChangeListener(this._onChange);
    },

    _onChange: function() {
        this.setState(getCampaignState());
    }

})

var CampaignTable = React.createClass({
    render: function() {

        var rows = [];

        _.forEach(this.props.campaigns, function(campaign) {
            console.log(campaign)
            rows.push(<CampaignRow campaign={campaign}/>)
        })

        var samplecampaign = {
            name: "kaaskop",
            state: "running"
        }



        return (
           <div className="row">
                {rows}
           </div>
        )
    }
})

var CampaignRow = React.createClass({ // todo: fix react-bootstrap routes: https://github.com/rackt/react-router/issues/83
    render: function() {
        var campaign = this.props.campaign;
        return (
            <div className="col-lg-4">
                <div className="panel panel-default running {campaign.completed}">
                    <Glyphicon glyph='screenshot' /> 
                    <div className="panel-content">
                        <h2>{campaign.name}</h2>
                        <span className="date"><label>Start date:</label> {campaign.startDate}</span>
                        <span className="actions">
                            <Button bsStyle='primary' onClick={RouterContainer.get().transitionTo.bind(null, "/home/campaign/" + campaign._id)}><Glyphicon glyph='stats' /> View</Button>
                            <Button bsStyle='info' onClick={RouterContainer.get().transitionTo.bind(null, "/home/campaign/" + campaign._id)}><Glyphicon glyph='edit' /> Edit</Button>
                            <Button bsStyle='danger' onClick={RouterContainer.get().transitionTo.bind(null, "/home/campaign/" + campaign._id + "/delete")}><Glyphicon glyph='trash' /> Delete</Button>
                        </span>
                    </div>
                </div>
            </div>
        )
    }
})


module.exports = Campaign;