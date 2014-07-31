
var cms = function(config, mongodbConnection, settings) {
	var self = this;
	self.settingsDecorator = function(cb) {
		return function(req, res) {
			settings.get(function(err, settingsInstance) {
				if(err) {
					console.error(err);
					res.send(500, 'Internal Server Error 5001');
					return;
				}
				cb(req, res, settingsInstance);
			});
		}
	};
	self.index = function(req, res, settings) {
		context = {
			version: config.version,
			settings: settings
		};
		res.render('cms', context);
	};
	self.homepage = function(req, res, settings) {
		context = {
			version: config.version,
			settings: settings
		};
		res.render('homepage', context);
	};
	return {
		index: self.settingsDecorator(self.index),
		homepage: self.settingsDecorator(self.homepage)
	};
};

exports.views = function(config, mongodbConnection, settings) {
	return new cms(config, mongodbConnection, settings);
};