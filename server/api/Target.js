var _ = require('lodash')

var Target = require('../models/target')

var targetApi = {
    get: function(data, res) {

    },

    getAll: function(user, res) {
        Target.findByUser({}, user._id, function(error, doc) {
            if (error) return res(error);

            return res(null, doc)
        })

    },

    create: function(user, data, res) {
        data.author = user._id;
        var screen_name = data.screen_name;

        Target.findOneByScreenName({}, screen_name, function(error, doc) {
            if (error) return res(error);

            if (doc) return res('doc already exists')

            var target = new Target(data);

            target.save(function(error) {
                if (error) return res(error);

                return res(null, target);
            })
        })
    },

    update: function(data, res) {

    },

    remove: function(user, data, res) {
        console.log('called remove target')
        console.log(data)
        Target.remove({_id: data._id}, res)
    }
}

module.exports = targetApi;
