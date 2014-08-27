// Although singletonlike patterns are usually bad,
// logger class is used in the whole system and injecting
// might be an overdesign.
// So, whenever logging is needed, create a new logger instance
// and log it.
// 
// TODO: how to get it? through a read-only rest request (via restizer)?
var mongoose = require('mongoose');
var logger = function() {
	var self = this;
	var Log = mongoose.model('Log');
	/**
	 * adds a new log entry
	 * @param {String} baseType base log type
	 * @param {String} type     log type
	 * @param {String} content  log description
	 * @param {Object} additionalData  additional data (optional but helpful)
	 * @param {Object} request  express request (optional but helpful)
	 */
	self.addLog = function(baseType, type, content, additionalData, request) {
		var rawLog = {
			baseType: baseType,
			type: type,
			content: content,
			date: new Date(),
			additionalData: {}
		};
		if(request) {
			if(request.user) {
				rawLog.additionalData.user = request.user._id;
			}
			rawLog.additionalData.ip = request.connection.remoteAddress;
		}
		if(additionalData) {
			rawLog.additionalData.additionalData = additionalData;
		}
		var log = new Log(rawLog);
		// logging is not blocking
		log.save(function(err, res) {
			if(err) {
				console.log('LOGGING FAILED:');
				console.error(rawLog);
			} else {
				console.log('LOGGED:');
				console.error(res.toJSON());
			}
		});
	};
	return {
		log: self.addLog
	};
};

exports.logger = function() {
	return new logger();
};