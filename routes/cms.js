
var cms = function(config, mongodbConnection) {
	var self = this;
	self.index = function(req, res) {
		res.send('INDEX');
	}
	return {
		index: self.index
	};
};

exports.views = function(config, mongodbConnection) {
	return new cms(mongodbConnection);
};