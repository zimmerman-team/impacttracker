var _ = require('lodash')

var Source = require('../models/source')

var SourceApi = {
    get: function(data, res) {

    },

    getAll: function(user, res) {
        Source.findByUser({}, user._id, function(error, doc) {
            if (error) return res(error);

            return res(null, doc)
        })
    },

    create: function(user, data, res) {
        data.author = user._id;
        var screen_name = data.screen_name;
        Source.findOneByScreenName({}, screen_name, function(error, doc) {
            if (error) return res(error);

            if (doc) return res('doc already exists')

            var source = new Source(data);

            source.save(function(error) {
                if (error) return res(error);

                return res(null, source);
            })
        })
    },

    update: function(data, res) {

    },

    remove: function(data, res) {
        console.log('called remove')
        console.log(data)
        Source.remove({_id: data._id}, res)
    }
}

module.exports = SourceApi;
