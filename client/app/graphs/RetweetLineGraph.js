var c3 = require('c3')

var _chart = null;

var RetweetLineGraph = {

    create: function(el) {

        console.log(el);

        _chart = c3.generate({
            bindto: el,
            data: {
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
                        format: '%m-%d %H:%M:%S'
                    }
                },
                y: {
                    label: "Tweets per minute"
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

    load: function(json) {
        _chart.load({
            json: json,
            keys: {
                x: "date",
                value: ['unrelated', 'source', 'intermediate', 'target']
            }
        })
    },

    addTweet: function() {

    }
}

module.exports = RetweetLineGraph;

