var url = require('url');
var i18next = require('i18next');
var _ = require('underscore');

exports.view = function(config, mongodbConnection, settings) {
	return function(request, res) {
		var parsedURL = url.parse(request.url, true);
		var query = parsedURL.query;
		var keys = query.keys.split(',');
		var result = {};
		_.each(keys, function(key) {
			result[key] = i18next.t(key);
		});
		res.json(result);
	};
};