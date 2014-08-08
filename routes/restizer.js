// RESTizer, creating REST urls for setting/getting/deleting/adding new documents
// When this code is good enough, I'll put it in restizer repo, creating an npm and angular module

var url = require('url');
var async = require('async');
var _ = require('underscore');
var sanitizeHtml = require('sanitize-html');

var restizer = function(config, mongodbConnection, settings) {
	var self = this;

	self.checkAddConstraints = function(Model, reqBody, settings, cb) {
		if(Model.canAddDocument === undefined) {
			cb(null, settings);
		} else {
			Model.canAddDocument(reqBody, settings, function(err) {
				cb(err, settings);
			});
		}
	};

	self.create = function(Model, reqBody, settings, cb) {
		if(Model.createDocument === undefined) {
			cb(null, new Model(reqBody), settings);
		} else {
			Model.createDocument(reqBody, settings, function(err, res) {
				cb(err, res, settings);
			});
		}
	};
	self.sanitize = function(Model, instance, settings, cb) {
		if(Model.sanitizeDocument === undefined) {
			cb(null, instance, settings);
		} else {
			Model.sanitizeDocument(instance, settings, function(err, res) {
				cb(err, res, settings);
			});
		}
	};
	self.save = function(Model, instance, settings, cb) {
		if(Model.saveDocument === undefined) {
			instance.save(function(err, doc) {
				cb(err, doc, settings);
			});
		} else {
			Model.saveDocument(instance, function(err, res) {
				cb(err, res, settings);
			});
		}
	};
	self.jsonize = function(Model, instances, settings, cb) {
		if(Model.jsonizeDocuments === undefined) {
			// That's not necessary but added for integrity
			// jsonize method always gives jsonized objects, not db docs.
			var jsonized = _.map(instances, function(instance) {
				return instance.toJSON();
			});
			cb(null, jsonized, settings);
		} else {
			Model.jsonizeDocuments(instances, function(err, res) {
				cb(err, res, settings);
			});
		}
	};

	self.add = function(Model) {
		return function(req, res) {
			async.waterfall([
				function(cb) {
					settings.get(cb);
				},
				function(settings, cb) {
					self.checkAddConstraints(Model, req.body, settings, cb);
				},
				function(settings, cb) {
					self.create(Model, req.body, settings, cb);
				},
				function(instance, settings, cb) {
					self.sanitize(Model, instance, settings, cb);
				},
				function(instance, settings, cb) {
					self.save(Model, instance, settings, cb);
				},
				function(instance, settings, cb) {
					self.jsonize(Model, [instance], settings, cb);
				}
			], function(err, instances, settings) {
				if(err) {
					var code = 5000;
					if(err.code !== undefined) {
						code = err.code;
					}
					res.send(500, 'Internal Server Error ' + code);
					console.error(err);
					return;
				}
				res.json({success:true, element:instances[0]});
			});
		};
	};
	self.get = function(Model) {
		return function(req, res) {
			var query = url.parse(req.url, true).query;
			var premise = Model.find({});
			if(query.skip !== undefined) {
				if(isNaN(query.skip)) {
					res.send(500, 'Internal Server Error 5003');
					return;
				}
				premise.skip(query.skip);
			}
			if(query.limit !== undefined) {
				if(isNaN(query.limit)) {
					res.send(500, 'Internal Server Error 5003');
					return;
				}
				premise.limit(query.limit);
			}
			async.waterfall([
				function(cb) {
					settings.get(cb);
				},
				function(settings, cb) {
					premise.exec(function(err, res) {
						cb(err, res, settings)
					});
				},
				function(docs, settings, cb) {
					self.jsonize(Model, docs, settings, cb);
				}
			], function(err, docs) {
				if(err) {
					var code = 5000;
					if(err.code !== undefined) {
						code = err.code;
					}
					res.send(500, 'Internal Server Error ' + code);
					console.error(err);
					return;
				}
				res.json({success:true, elements:docs});
			});
		};
	};

	self.getOne = function(Model) {
		return function(req, res) {
			var query = url.parse(req.url, true).query;
			var premise = Model.findById(req.params.id);
			async.waterfall([
				function(cb) {
					settings.get(cb);
				},
				function(settings, cb) {
					premise.exec(function(err, res) {
						cb(err, res, settings)
					});
				},
				function(doc, settings, cb) {
					self.jsonize(Model, [doc], settings, cb);
				}
			], function(err, docs) {
				if(err) {
					var code = 5000;
					if(err.code !== undefined) {
						code = err.code;
					}
					res.send(500, 'Internal Server Error ' + code);
					console.error(err);
					return;
				}
				res.json({success:true, element:docs[0]});
			});
		};
	};

	self.restize = function(app, modelName, urlName) {
		var Model = mongodbConnection.model(modelName);
		app.get('/' + urlName, self.get(Model));
		app.get('/' + urlName + '/:id', self.getOne(Model));
		app.post('/' + urlName, self.add(Model));
	};
};

exports.restizer = function(config, mongodbConnection, settings) {
	return new restizer(config, mongodbConnection, settings);
};