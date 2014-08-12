// RESTizer, creating REST urls for setting/getting/deleting/adding new documents
// When this code is good enough, I'll put it in restizer repo, creating an npm and angular module

var url = require('url');
var async = require('async');
var _ = require('underscore');
var sanitizeHtml = require('sanitize-html');

/**
 * Restizer provides RESTful methods for collections.
 * can be customized using static methods of collections.
 * @param  {Object} config            config instance injected from app
 * @param  {Object} mongodbConnection mongodb connection instance injected from app
 * @param  {Object} settings          settings getter class injected from app
 * @return {Object}                   Restizer instance to restize collections
 */
var restizer = function(config, mongodbConnection, settings) {
	var self = this;

	/**
	 * Checks adding constraints, ie, whether the
	 * current user can add a new document to the collection and parameters are valid
	 * @param  {Object}   Model    mongoose model
	 * @param  {Object}   reqBody  request body, the body to create object from
	 * @param  {Object}   user     User document or null if not logged in
	 * @param  {Object}   settings settings document got from settings getter
	 * @param  {Function} cb       callback to be called after checking for constraints.
	 *                             should be called as cb(error, settings)
	 * @return {null}            null
	 */
	self.checkAddConstraints = function(Model, reqBody, user, settings, cb) {
		if(Model.canAddDocument === undefined) {
			cb(null, settings);
		} else {
			Model.canAddDocument(reqBody, user, settings, function(err) {
				cb(err, settings);
			});
		}
	};

	/**
	 * Checks editing constraints, ie, whether the
	 * current user can edit the document and parameters are valid
	 * @param  {Object}   Model    mongoose model
	 * @param  {Object}   document document to be updated
	 * @param  {Object}   reqBody  request body, the body to modify object
	 * @param  {Object}   user     User document or null if not logged in
	 * @param  {Object}   settings settings document got from settings getter
	 * @param  {Function} cb       callback to be called after checking for constraints.
	 *                             should be called as cb(error, document, newBody, settings)
	 *                             where newBody contains to-be-modified fields
	 *                             document should not be modified
	 * @return {undefined}            undefined
	 */
	self.checkEditConstraints = function(Model, document, reqBody, user, settings, cb) {
		if(Model.canEditDocument === undefined) {
			cb(null, document, reqBody, settings);
		} else {
			Model.canEditDocument(reqBody, document, user, settings, function(err, newBody) {
				cb(err, document, newBody, settings);
			});
		}
	};

	/**
	 * Edits the document using the given body
	 * @param  {Object}   Model    mongoose model
	 * @param  {Object}   document document to be updated
	 * @param  {Object}   reqBody  request body, the body to modify object
	 * @param  {Object}   user     User document or null if not logged in
	 * @param  {Object}   settings settings document got from settings getter
	 * @param  {Function} cb       callback to be called after modifying the document
	 *                             should be called as cb(error, document, settings)
	 *                             document should be modified here
	 * @return {undefined}            undefined
	 */
	self.editDocument = function(Model, document, reqBody, user, settings, cb) {
		if(Model.editDocument === undefined) {
			_.each(reqBody, function(value, key) {
				document[key] = value;
			});
			cb(null, document, settings);
		} else {
			Model.editDocument(reqBody, document, user, settings, function(err, modifiedDocument) {
				cb(err, modifiedDocument, settings);
			});
		}
	};
	/**
	 * Creates a document from the given object
	 * @param  {Object}   Model    mongoose model
	 * @param  {Object}   reqBody  request body, the body to create object from
	 * @param  {Object}   user     User document or null if not logged in
	 * @param  {Object}   settings settings document got from settings getter
	 * @param  {Function} cb       callback to be called after creating the document
	 *                             should be called as cb(error, document, settings)
	 * @return {undefined}            undefined
	 */
	self.createDocument = function(Model, reqBody, user, settings, cb) {
		if(Model.createDocument === undefined) {
			cb(null, new Model(reqBody), settings);
		} else {
			Model.createDocument(reqBody, user, settings, function(err, res) {
				cb(err, res, settings);
			});
		}
	};

	/**
	 * Sanitizes the given document or object
	 * @param  {Object}   Model    mongoose model
	 * @param  {Object}   doc      mongoose document (not necessarily an existing one)
	 * @param  {Object}   user     User document or null if not logged in
	 * @param  {Object}   settings settings doc got from settings getter
	 * @param  {Function} cb       callback to be called after sanitizing the document
	 *                             should be called as cb(error, document, settings)
	 * @return {undefined}            undefined
	 */
	self.sanitize = function(Model, doc, user, settings, cb) {
		if(Model.sanitizeDocument === undefined) {
			cb(null, doc, settings);
		} else {
			Model.sanitizeDocument(doc, user, settings, function(err, res) {
				cb(err, res, settings);
			});
		}
	};

	/**
	 * Saves the given document.
	 * currently inserts it as a new object
	 * @param  {Object}   Model    mongoose model
	 * @param  {Object}   doc mongoose document to be inserted
	 * @param  {Object}   user     User document or null if not logged in
	 * @param  {Object}   settings settings document got from settings getter
	 * @param  {Function} cb       callback to be called after saving the document
	 *                             should be called as cb(error, savedDocument, settings)
	 * @return {undefined}            undefined
	 */
	self.save = function(Model, doc, user, settings, cb) {
		if(Model.saveDocument === undefined) {
			doc.save(function(err, doc) {
				cb(err, doc, settings);
			});
		} else {
			Model.saveDocument(doc, function(err, res) {
				cb(err, res, settings);
			});
		}
	};
	/**
	 * Jsonizes the given document into an object
	 * @param  {Object}  Model     mongoose model
	 * @param  {List}    docs      list of mongoose documents to be jsonized
	 * @param  {List}    fields    a list of fields to be serialized
	 *                             or null if all fields are requested.
	 *                             This field is merely a recommendation and
	 *                             does not necessarily provide the callback
	 *                             with the requested fields if certain
	 *                             conditions are not met.
	 * @param  {Object}   user     User document or null if not logged in
	 * @param  {Object}   settings settings document got from settings getter
	 * @param  {Function} cb       callback to be called after jsonizing the documents
	 *                             should be called as cb(error, [jsonizedObject, ...], settings)
	 * @return {undefined}             undefined
	 */
	self.jsonize = function(Model, docs, fields, user, settings, cb) {
		if(Model.jsonizeDocuments === undefined) {
			// That's not necessary but added for integrity
			// jsonize method always gives jsonized objects, not db docs.
			var jsonized = undefined;

			if(fields === null) {
				jsonized = _.map(docs, function(doc) {
					return doc.toJSON();
				});
			} else {
				jsonized = _.map(docs, function(doc) {
					return _.pick(doc.toJSON(), fields);
				});
			}
			cb(null, jsonized, settings);
		} else {
			Model.jsonizeDocuments(docs, fields, user, function(err, res) {
				cb(err, res, settings);
			});
		}
	};

	self.add = function(Model) {
		return function(req, res) {
			var user = req.user;
			async.waterfall([
				function(cb) {
					settings.get(cb);
				},
				function(settings, cb) {
					self.checkAddConstraints(Model, req.body, user, settings, cb);
				},
				function(settings, cb) {
					self.createDocument(Model, req.body, user, settings, cb);
				},
				function(doc, settings, cb) {
					self.sanitize(Model, doc, user, settings, cb);
				},
				function(doc, settings, cb) {
					self.save(Model, doc, user, settings, cb);
				},
				function(doc, settings, cb) {
					self.jsonize(Model, [doc], null, user, settings, cb);
				}
			], function(err, docs, settings) {
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

	self.edit = function(Model) {
		return function(req, res) {
			var user = req.user;
			async.waterfall([
				function(cb) {
					settings.get(cb);
				},
				function(settings, cb) {
					Model.findById(req.params.id, function(err, res) {
						cb(err, res, settings);
					})
				},
				function(doc, settings, cb) {
					self.checkEditConstraints(Model, doc, req.body, user, settings, cb);
				},
				function(doc, newBody, settings, cb) {
					self.editDocument(Model, doc, newBody, user, settings, cb);
				},
				function(doc, settings, cb) {
					self.sanitize(Model, doc, user, settings, cb);
				},
				function(doc, settings, cb) {
					self.save(Model, doc, user, settings, cb);
				},
				function(doc, settings, cb) {
					self.jsonize(Model, [doc], null, user, settings, cb);
				}
			], function(err, docs, settings) {
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
	}
	self.get = function(Model) {
		return function(req, res) {
			var query = url.parse(req.url, true).query;
			var premise = undefined;
			if(query.ids) {
				var ids = query.ids.split(',');
				premise = Model.find({_id:{$in:ids}});
			} else {
				premise = Model.find({});
			}
			if(query.skip !== undefined) {
				if(isNaN(query.skip) || query.skip < 0) {
					res.send(500, 'Internal Server Error 5003');
					return;
				}
				premise.skip(query.skip);
			}
			// TODO: default limiting?
			// setting max limit?
			if(query.limit !== undefined) {
				if(isNaN(query.limit) || query.limit <= 0) {
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
					var fields = null;
					if(query.fields !== undefined) {
						fields = query.fields.split(',');
					}
					self.jsonize(Model, docs, fields, req.user, settings, cb);
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
					var fields = null;
					if(query.fields !== undefined) {
						fields = query.fields.split(',');
					}
					self.jsonize(Model, [doc], fields, req.user, settings, cb);
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
		app.put('/' + urlName + '/:id', self.edit(Model));
		app.post('/' + urlName, self.add(Model));
	};
};

exports.restizer = function(config, mongodbConnection, settings) {
	return new restizer(config, mongodbConnection, settings);
};