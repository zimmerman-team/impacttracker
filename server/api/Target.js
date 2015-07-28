var _ = require('lodash')

var Target = require('../models/target')

var targetApi = {
    get: function(data, res) {

    },

    getAll: function(data, res) {
        Target.find({}, function(error, doc) {
            console.log(doc)

            if (error) return res(error);

            return res(null, doc)
        })

    },

    create: function(user, data, res) {
        console.log(data)
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