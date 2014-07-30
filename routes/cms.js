
var cms = function(config, mongodbConnection) {
	var self = this;
	self.index = function(req, res) {
		context = {
			version: config.version
		};
		res.render('cms', context);
	}
	return {
		index: self.index
	};
};

exports.views = function(config, mongodbConnection) {
	return new cms(config, mongodbConnection);
};