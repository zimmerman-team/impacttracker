var _ = require('lodash')

var Target = require('../models/target')

var targetApi = {
    get: function(data, res) {

    },

    getAll: function(data, res) {

    },

    create: function(user, data, res) {
        var target = new Target(data);

        target.save(function(error) {
            if (error) return res(error);

            return res(null, target);
        })
    },

    update: function(data, res) {

    },

    remove: function(data, res) {

    }
}

module.exports = targetApi;