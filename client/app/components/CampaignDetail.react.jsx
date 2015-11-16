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
            RouterContainer.get().transitionTo('/home/campaign');
        } else {
            // change this to work with flux
            ApiService.createCampaign(campaign, function(id) {
                console.log("transitioning")
                RouterContainer.get().transitionTo('/home/campaign');
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

    _onSourceChange: function(index, event) {
        this.state.sources[index].checked = !this.state.sources[index].checked
        this.setState({
            sources: this.state.sources 
        })
    },

    _onTargetChange: function(index, event) {
        this.state.targets[index].checked = !this.state.targets[index].checked
        this.setState({
            targets: this.state.targets
        })
        // var checked = event.target.checked;
    },

    _onSourceRemove: function(index) {
        ApiService.removeSource(this.state.sources[index]._id)
    },

    _onTargetRemove: function(index) {
        console.log('clicked')
        ApiService.removeTarget(this.state.targets[index]._id)
    },

    _onSourceToggleAll: function(event) {
        this.setState({
            sources: _.map(this.state.sources, function(source) {
                source.checked = !source.checked
                return source
            })
        })
    },

    _onTargetToggleAll: function(event) {
        this.setState({
            targets: _.map(this.state.targets, function(target) {
                target.checked = !target.checked
                return target
            })
        })
    },

    // also apply front-end relevant properties (like checked variable)
    getInitialState: function() {
        var state = getCampaignState();

        var sourceCampaigns = state.campaign.sources
        var targetCampaigns = state.campaign.targets

        state.sources = _.map(state.sources, function(source) {
            source.checked = _.find(sourceCampaigns, {_id: source._id}) ? true : false
            return source
        });

        state.targets = _.map(state.targets, function(target) {
            target.checked = _.find(targetCampaigns, {_id: target._id}) ? true : false
            return target
        });

        console.log(state)

        return state;
    },

    render: function() {

        var sourceChecks = _.map(this.state.sources, function(source, index) {
            return (
                <tr>
                    <td><Input type='checkbox' value={source._id} name="source" onChange={this._onSourceChange.bind(null, index)} label={source.screen_name} checked={source.checked} /></td>
                    <td><span className="glyphicon glyphicon-remove" onClick={this._onSourceRemove.bind(null, index)}></span></td>
                </tr>
        )
        }.bind(this))

        var targetChecks = _.map(this.state.targets, function(target, index) {
            return (
                <tr>
                    <td><Input type='checkbox' value={target._id} name="target" onChange={this._onTargetChange.bind(null, index)} label={target.screen_name} checked={target.checked} /></td>
                    <td><span className="glyphicon glyphicon-remove" onClick={this._onTargetRemove.bind(null, index)} ></span></td>
                </tr>
        )
        }.bind(this))

        var sourceCheckAll = (
            <th><Input type='checkbox' onClick={this._onSourceToggleAll} label="Check all" /></th>
        )
        var targetCheckAll = (
            <th><Input type='checkbox' onClick={this._onTargetToggleAll} label="Check all"/></th>
        )



        return (
            <div className="container campaigndetail">
                <h1>Campaign editor</h1>

                <div className="panel panel-default">
                    <div className="panel-content">
                        <form ref="form" onSubmit={this.updateCampaign}>

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
                                <DateTimeField 
                                    inputProps={{name: "startDate"}} 
                                    minDate={moment()}
                                    defaultText="select campaign start date" />
                            </div>
                            <div className="col-lg-3 daterange">
                                <DateTimeField 
                                    inputProps={{name: "endDate"}} 
                                    minDate={moment()}
                                    maxDate={moment().add('days', 3)}
                                    defaultText="select campaign end date" />
                            </div>
                            </div> 
                            
                            <div className="row">
                                <div className="col-lg-4 cb">
                                    <label for="sourceInput">Sources</label>
                                    <table className="table">
                                        <thead>
                                            <tr>
                                                {sourceCheckAll}
                                                <th></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {sourceChecks}
                                        </tbody>
                                    </table>
                                    <Input type="text" ref="sourceInput" buttonAfter={<ButtonInput bsStyle="primary" onClick={this._onAddSourceClick} value="Add source" placeholder="Add a new source"/>} />  
                                </div>
                            </div>

                            <div className="row">
                                <div className="col-lg-4 cb">
                                    
                                    <label for="targetInput">Targets</label>
                                    <table className="table">
                                        <thead>
                                            <tr>
                                                {targetCheckAll}
                                                <th></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {targetChecks}
                                        </tbody>
                                    </table>
                                    <Input type="text" ref="targetInput" buttonAfter={<ButtonInput bsStyle="primary" onClick={this._onAddTargetClick} value="Add target" placeholder="Add a new target" />} />  
                                    <buttonInput value="Add target" />
                                </div>
                            </div>

                            <div className="row">
                            <div className="col-lg-3">
                            <ButtonInput type='submit' bsStyle="primary" value={this.state.campaign._id ? 'Update' : 'Create'} />
                            </div>
                            </div>
                        </form>
                    </div>
                </div>
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
