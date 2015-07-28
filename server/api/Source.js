var _ = require('lodash')

var Source = require('../models/source')

var SourceApi = {
    get: function(data, res) {

    },

    getAll: function(data, res) {
        Source.find({}, function(error, doc) {
            if (error) return res(error);

            return res(null, doc)
        })
    },

    create: function(user, data, res) {
        console.log(data)
        var source = new Source(data);

        source.save(function(error) {
            if (error) return res(error);

            return res(null, source);
        })
    },

    update: function(data, res) {

    },

    remove: function(data, res) {

    }
}

module.exports = SourceApi;