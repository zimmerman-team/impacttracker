var React = require('react')
var Router = require('react-router');
var _ = require('lodash')
var Authenticated = require("./Authenticated.react.jsx");
var CampaignStore = require("../stores/CampaignStore")
var ApiService = require("../services/ApiService.js");

var Table = require('react-bootstrap').Table;
var SplitButton = require('react-bootstrap').SplitButton;
var MenuItem = require('react-bootstrap').MenuItem;
var Button = require('react-bootstrap').Button;
var Glyphicon = require('react-bootstrap').Glyphicon;
var Input = require('react-bootstrap').Input;

var moment = require("moment")

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
                        <span style={{display: "none"}} className="toggle-tag">Toggle visible campaigns</span>
                        <a id="toggle-planned" className="legend planned">Planned</a>
                        <a id="toggle-running" className="legend running">Started</a>
                        <a id="toggle-completed" className="legend completed">Completed</a>
                    </div>
                    <div style={{display: "none"}} className="col-lg-2">
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
            rows.push(<CampaignRow campaign={campaign}/>)
        })

        return (
           <div className="row">
                {rows}
           </div>
        )
    }
})

var CampaignRow = React.createClass({ // todo: fix react-bootstrap routes: https://github.com/rackt/react-router/issues/83
    
    _onDeleteCampaignClick: function(id) {
        var result = confirm("Are you sure you want to delete this campaign? This cannot be undone");
        if (result) {
            ApiService.deleteCampaign(id);
        }
    },

    _onStopCampaignClick: function(id) {
        ApiService.stopCampaign(id);
    },

    render: function() {
        var campaign = this.props.campaign;

        console.log(campaign.state)

        var stopButton = campaign.state === "running" ?
            <Button bsStyle='info' onClick={this._onStopCampaignClick.bind(null, campaign._id)}><Glyphicon glyph='edit' /> Stop</Button>
            : null

        return (
            <div className="col-lg-4">
                <div className={"panel panel-default " + campaign.state}>
                    <Glyphicon glyph='screenshot' /> 
                    <div className="panel-content">
                        <h2>{campaign.name}</h2>
                        <span className="date"><label>Start date:</label> {moment(campaign.creationDate).format('MMMM Do YYYY, h:mm:ss a')}</span>
                        <span className="actions">
                            <Button bsStyle='primary' onClick={RouterContainer.get().transitionTo.bind(null, "/home/campaign/view/" + campaign._id)}><Glyphicon glyph='stats' /> View</Button>
                            {stopButton}
                            <Button bsStyle='danger' onClick={this._onDeleteCampaignClick.bind(null, campaign._id)}><Glyphicon glyph='trash' /> Delete</Button>
                        </span>
                    </div>
                </div>
            </div>
        )
    }
})


module.exports = Campaign;