var c3 = require('c3')
var moment = require('moment')

var _chart = null;
var _formatter = function(x) { return moment(x).format('YYYY-MM-DD HH:mm') }

var RetweetLineGraph = {

    create: function(el) {

        _chart = c3.generate({
            bindto: el,
            data: {
                labels: true,
                json: [
                    // {date: '2014-01-01', unrelated: 100, source: 200, intermediate: 300, target: 400, },
                    // {date: '2014-01-02', unrelated: 100, source: 200, intermediate: 300, target: 400, },
                    // {date: '2014-01-03', unrelated: 100, source: 200, intermediate: 300, target: 400, },
                    // {date: '2014-01-04', unrelated: 100, source: 200, intermediate: 300, target: 400, },
                ],
                keys: {
                    x: "date",
                    // xFormat: '%Y-%m-%d %H:%M:%S',
                    value: ['unrelated', 'source', 'intermediate', 'target']
                }
            },
            axis: {
                x: {
                    label: "Time",
                    type: 'timeseries',
                    tick: {
                        // culling: {
                        //     max: 4
                        // },
                        fit: true,
                        count: 20,
                        // format: '%m-%d:%H'
                        format: function(x) {
                            return _formatter(x);
                        }
                    }
                },
                y: {
                    label: "Number of tweets"
                }
            },
            size: {
                height: 800
            },
            padding: {
                top: 20,
                bottom: 20
            }
        });
    },

    destroy: function() {
        _chart.destroy();
        _chart = null;
    },

    load: function(json, daterange) {

        switch (daterange) {
            case "minute":
                _formatter = function(x) { return moment(x).format('YYYY-MM-DD HH:mm') }
                break;
            case "hour":
                _formatter = function(x) { return moment(x).format('YYYY-MM-DD HH:mm') }
                break;
            case "default":
                _formatter = function(x) { return moment(x).format('YYYY-MM-DD HH:mm') }
       }

        // console.log('loading chart...')
        // console.log(json)
        // console.log(daterange)
                
        _chart.load({
            json: json,
            keys: {
                x: "date",
                value: ['unrelated', 'source', 'intermediate', 'target']
            }
        })

        _chart.flush()
    },

    addTweet: function() {

    }
}

module.exports = RetweetLineGraph;

