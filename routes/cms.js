
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
	self.createView = function(viewName) {
		return function(req, res, settings) {
			context = {
				version:config.version,
				settings:settings,
				user:req.user
			};
			// temporarily hard coded, will be changed with the template system
			res.render('melis/'+viewName, context);
		};
	};
	self.createCMSView = function(viewName) {
		return self.settingsDecorator(self.createView(viewName));
	}
	return {
		index: self.createCMSView('index'),
		homepage: self.createCMSView('homepage')
	};
};

exports.views = function(config, mongodbConnection, settings) {
	return new cms(config, mongodbConnection, settings);
};