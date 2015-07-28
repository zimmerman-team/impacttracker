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
                    <div className="col-lg-4 col-lg-offset-8">
                       <Button className="pull-right new-campaign" onClick={RouterContainer.get().transitionTo.bind(null, "/home/campaign/new")} bsStyle="primary" bsSize="large"><Glyphicon glyph='plus' /> New campaign</Button>
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
    render: function() {
        var campaign = this.props.campaign;
        return (
            <div className="col-lg-4">
                <div className="panel">
                    <h1>{campaign.name}</h1>
                    <span className="subjects"><label>Subjects used</label>{campaign.handle}</span>
                    <span className="author"><label>Author</label>{campaign.author || "-"}</span>
                    <span className="completed">{campaign.completed || false}</span>
                    <span className="date"><label>Runs</label>{campaign.runAt || "-"}</span>
                    <span className="actions">
                        <Button bsStyle='success' onClick={RouterContainer.get().transitionTo.bind(null, "/home/campaign/" + campaign._id)}><Glyphicon glyph='stats' /> View</Button>
                        <Button bsStyle='primary' onClick={RouterContainer.get().transitionTo.bind(null, "/home/campaign/" + campaign._id)}><Glyphicon glyph='edit' /> Edit</Button>
                        <Button bsStyle='danger' onClick={RouterContainer.get().transitionTo.bind(null, "/home/campaign/" + campaign._id + "/delete")}><Glyphicon glyph='trash' /> Delete</Button>
                    </span>
                </div>
            </div>
        )
    }
})


module.exports = Campaign;