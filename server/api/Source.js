var _ = require('lodash')

var Source = require('../models/source')

var SourceApi = {
    get: function(data, res) {

    },

    getAll: function(data, res) {

    },

    create: function(user, data, res) {
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