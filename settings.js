// settings class should be injected to all necessary classes.
// no file should require it directly, otherwise more than one
// instances might be created, resulting in inconsistency.
var settingsManager = function(config, mongodbConnection) {
	var self = this;
	var Settings = mongodbConnection.model('Settings');
	self.settings = null;
	self.loadDefaults = function(cb) {
		var settings = new Settings({
			title: 'RevaniCM Demo',
			subtitle: 'RevaniCM: A brand new Content Management System',
			articleShortContentMaxSize: 400
		});
		settings.save(function(err, res) {
			if(err) {
				console.error(err);
				cb(err);
			} else {
				self.settings = res;
				cb(null, self.settings.toJSON());
			}
		});
	};
	self.fetchSettings = function(cb) {
		if(self.settings !== null) {
			cb(null, self.settings.toJSON());
			return;
		}
		Settings.findOne({}, function(err, res) {
			if(err) {
				console.error(err);
				cb(err);
			} else {
				self.settings = res;
				if(self.settings === null) {
					self.loadDefaults(cb);
				} else {
					if(self.settings.articleShortContentMaxSize === undefined) {
						self.settings.articleShortContentMaxSize = 400;
					}
					cb(null, self.settings.toJSON());
				}
			}
		});
	};
	return {
		get: self.fetchSettings
	};
};

exports.settings = function(config, mongodbConnection) {
	return new settingsManager(config, mongodbConnection);
};