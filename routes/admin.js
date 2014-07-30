
var admin = function(config, mongodbConnection) {
	var self = this;
	self.index = function(req, res) {
		res.send('ADMIN INDEX');
	}
	return {
		index: self.index
	};
};

exports.views = function(config, mongodbConnection) {
	return new admin(mongodbConnection);
};