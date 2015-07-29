var React = require('react')
var _ = require('lodash')
var Router = require('react-router');
var Authenticated = require("./Authenticated.react.jsx");
var CampaignStore = require("../stores/CampaignStore")

var Input = require('react-bootstrap').Input;
var SplitButton = require('react-bootstrap').SplitButton;
var ButtonInput = require('react-bootstrap').ButtonInput;

var ApiService = require('../services/ApiService')
var ApiActions = require("../actions/CampaignActions")

var DatePicker = require('react-datepicker')
var moment = require('moment');

var RouterContainer = require('../util/RouterContainer')

var DateTimeField = require('react-bootstrap-datetimepicker');

function getCampaignState(id) {
    console.log('called get state!')
    return {
        campaign: CampaignStore.get(id) || {
            sources: [],
            targets: []
        },
        sources: CampaignStore.getAllSources(),
        targets: CampaignStore.getAllTargets()
    }
}

var CampaignDetail = React.createClass({

    updateCampaign: function(event, data) {
        event.preventDefault();

        // var campaign = this.state.campaign;
        // var campaignId = campaign._id;

        // var elements = this.refs.form.getDOMNode().elements;
        var formData = $(event.target).serializeArray();

        console.log(formData)

        var sources = _.pluck(_.filter(formData, {name: "source"}), "value")
        var targets = _.pluck(_.filter(formData, {name: "target"}), "value")

        var startDate = _.find(formData, {name: "startDate"}).value
        var endDate = _.find(formData, {name: "endDate"}).value

        var name = _.find(formData, {name: "name"}).value
        var keywords = _.find(formData, {name: "keywords"}).value

        // if (!startDate || !endDate && !handle && !sources.length && !targets.length)
        //     return;


        var campaign = {
            // _id: this.state.campaign._id,
            startDate: moment(new Date(startDate)).format('x'),
            endDate: moment(new Date(endDate)).format('x'),
            handle: keywords,
            name: name,
            sources: sources,
            targets: targets
        }

        console.log(campaign)

        if (this.state.campaign._id) {
            ApiService.updateCampaign(this.state.campaign.id, campaign);          
        } else {
            // change this to work with flux
            ApiService.createCampaign(campaign, function(id) {
                RouterContainer.get().transitionTo('/home/campaign/' + id);
            });
            
        }

    },

    _onAddSourceClick: function(event) {
        var sourceInput = this.refs.sourceInput.getValue()
        ApiService.createSource(sourceInput);
    },

    _onAddTargetClick: function(event) {
        var targetInput = this.refs.targetInput.getValue()
        ApiService.createTarget(targetInput);
    },

    _onSourceChange: function(sourceId, event) {
        // var checked = event.target.checked;
    },

    _onTargetChange: function(targetId, event) {
        // var checked = event.target.checked;
    },

    getInitialState: function() {
        return getCampaignState();
    },

    render: function() {
        console.log(this.state.campaign)

        var sources = this.state.sources
        var targets = this.state.targets

        var sourceCampaigns = this.state.campaign.sources
        var targetCampaigns = this.state.campaign.targets

        var sourceChecks = [];
        var targetChecks = [];


        _.forEach(sources, function(source) {
            if (_.find(sourceCampaigns, {_id: source._id})) {
                sourceChecks.push(<Input type='checkbox' value={source._id} name="source" onChange={this._onSourceChange.bind(null, source._id)} label={source.screen_name} checked />)
            } else {
                sourceChecks.push(<Input type='checkbox' value={source._id} name="source" onChange={this._onSourceChange.bind(null, source._id)} label={source.screen_name} />)
            }
        }.bind(this))

        _.forEach(targets, function(target){
            if (_.find(targetCampaigns, {_id: target._id})) {
                targetChecks.push(<Input type='checkbox' value={target._id} name="target" onChange={this._onTargetChange.bind(null, target._id)} label={target.screen_name} checked />)
            } else {
                targetChecks.push(<Input type='checkbox' value={target._id} name="target" onChange={this._onTargetChange.bind(null, target._id)} label={target.screen_name} />)
            }
        }.bind(this))


        return (
          <form ref="form" onSubmit={this.updateCampaign}>
            <h2>Campaign Name</h2>
            <Input name="name" type="text" value={this.state.campaign.name} />  
            <h2>Campaign keywords (hashtags)</h2>
            <Input name="keywords" type="text" value={this.state.campaign.handle}/>  
            <h2>Date range</h2>
            <DateTimeField inputProps={{name: "startDate"}} dateTime={moment(this.state.campaign.startDate).format('x')} defaultText="select campaign start date" />
            <DateTimeField inputProps={{name: "endDate"}} dateTime={moment(this.state.campaign.endDate).format('x')} defaultText="select campaign end date" />

            <h2>Sources</h2>
            {sourceChecks}
            <Input type="text" ref="sourceInput" buttonAfter={<ButtonInput bsStyle="primary" onClick={this._onAddSourceClick} value="Add source" />} />  

            <h2>Targets</h2>
            {targetChecks}
            <Input type="text" ref="targetInput" buttonAfter={<ButtonInput bsStyle="primary" onClick={this._onAddTargetClick} value="Add target" />} />  
            <buttonInput value="Add target" />
            <ButtonInput type='submit' value={this.state.campaign._id ? 'Update' : 'Create'} />
          </form>
        )
    },

    componentDidMount: function() {
        CampaignStore.addChangeListener(this._onChange);
        this.setState(getCampaignState(this.props.params.id));
    },

    componentWillUnmount: function() {
        CampaignStore.removeChangeListener(this._onChange);
    },

    _onChange: function() {
        this.setState(getCampaignState(this.props.params.id));
    }

})


module.exports = CampaignDetail;