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
            startDate: startDate,
            endDate: endDate,
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
        var checked = event.target.checked;
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

        _.forEach(targets, function(target) {
            if (_.find(targetCampaigns, {_id: target._id})) {
                targetChecks.push(<Input type='checkbox' value={target._id} name="target" onChange={this._onTargetChange.bind(null, target._id)} label={target.screen_name} checked />)
            } else {
                targetChecks.push(<Input type='checkbox' value={target._id} name="target" onChange={this._onTargetChange.bind(null, target._id)} label={target.screen_name} />)
            }
        }.bind(this))


        return (
            <div className="container campaigndetail">
                <h1>Campaign editor</h1>
                <form ref="form" onSubmit={this.updateCampaign}>

                    <fieldset>

                    <div className="row">
                    <div className="col-lg-3">
                    <label for="name">Campaign name</label>
                    <Input name="name" type="text" value={this.state.campaign.name} placeholder="Campaign Name"/>
                    </div>
                    </div>  

                    <div className="row">
                    <div className="col-lg-6">
                    <label for="keywords">Campaign keywords (hashtags)</label>
                    <Input name="keywords" type="text" value={this.state.campaign.handle} placeholder="Enter keywords, seperated by commas"/>  
                    </div>
                    </div>

                    <div className="row">
                    <div className="col-lg-12">
                    <label for="startDate">Date range</label>
                    </div>
                    <div className="col-lg-3 daterange">
                        <DatePicker
                            key="example4"
                            name="startDate"
                            selected={this.state.campaign.start_date}
                            onChange={this.handleBoundDateChange}
                            placeholderText="Start date"/>
                    </div>
                    <div className="col-lg-3 daterange">
                        <DatePicker
                            key="example5"
                            name="endDate"
                            selected={this.state.campaign.end_date}
                            onChange={this.handleBoundDateChange2}
                            placeholderText="End date"/>
                    </div>
                    </div> 
                    
                    <div className="row">
                    <div className="col-lg-3 cb">
                    <label for="sourceInput">Sources</label>
                    {sourceChecks}
                    <Input type="text" ref="sourceInput" buttonAfter={<ButtonInput bsStyle="primary" onClick={this._onAddSourceClick} value="Add source" placeholder="Add a new source"/>} />  
                    </div>
                    </div>

                    <div className="row">
                    <div className="col-lg-3 cb">
                    <label for="targetInput">Targets</label>
                    {targetChecks}
                    <Input type="text" ref="targetInput" buttonAfter={<ButtonInput bsStyle="primary" onClick={this._onAddTargetClick} value="Add target" placeholder="Add a new target" />} />  
                    <buttonInput value="Add target" />
                    </div>
                    </div>

                    <div className="row">
                    <div className="col-lg-3">
                    <ButtonInput type='submit' bsStyle="primary" value={this.state.campaign._id ? 'Update' : 'Create'} />
                    </div>
                    </div>

                    </fieldset>

                </form>
            </div>
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