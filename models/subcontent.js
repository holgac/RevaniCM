'use strict';

/**
 * Module dependencies.
 */
// var crypto = require('crypto');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Mixed = Schema.Types.Mixed;
var _ = require('underscore');
var constants = require('../constants');

module.exports = function(config) {
	/**
	* SubContent Schema
	*/
	var SubContentSchema = new Schema({
		// a name to identify subcontents
		name: {
			type: String
		},
		// a list of positions of the subcontent,
		// each must match a position in the template and
		// each must be unique.
		positions: {
			type: Array
		},
		// 
		type: {
			type: Number,
			default: 0
		},
		data: {
			type: Mixed,
			default: null
		}
	});

	SubContentSchema.statics.canAddDocument = function(body, user, settings, cb) {
		if(body.name == undefined || body.name.length == 0) {
			cb({
				message: 'name is empty',
				code: 5004
			});
			return;
		}
		if(body.type == undefined || isNaN(body.type)) {
			cb({
				message: 'type is undefined',
				code: 5004
			});
			return;
		}
		if(!user) {
			cb({
				message: 'Unauthorized',
				code:5002
			});
			return;
		}
		user.permissions(function(err, permissions) {
			if(err) {
				cb(err);
				return;
			}
			var permCode = constants.UserGroup.permissions.editSubCategory;
			if(permissions & permCode) {
				cb();
			} else {
				cb({
					message: 'Unauthorized',
					code: 5002
				});
			}
		});
	};

	SubContentSchema.statics.sanitizeDocument = function(instance, user, settings, cb) {
		var dataFields = {
			1: ['text'],
			2: ['image'],
			3: ['menu', 'template'],
		};
		instance.data = _.pick(instance.data, dataFields[instance.type]);
		cb(null, instance);
	};

	SubContentSchema.statics.staticMethods = function() {
		return ['at'];
	};

	SubContentSchema.statics.at = function(request, user, settings, app, cb) {
		var SubContent = mongoose.model('SubContent');
		var position = request.params.customParam;
		var positionPipeline = [
			{
				$unwind:'$positions'
			},
			{
				$match: {
					'positions': position
				}
			},
		];

		SubContent.aggregate(positionPipeline, function(err, results) {
			if(err) {
				console.error(err);
				cb(err);
				return;
			}
			var subcontent = null;
			if(results.length == 0) {
				cb({
					message: 'SubContent not found!',
					code: 404
				});
				return;
			}
			var subcontent = results[0];
			var types = constants.SubContent.types;
			// TODO: warning log if results.size > 1
			if(subcontent.type == types.text) {
				cb(null, subcontent.data.text);
				return;
			} else if(subcontent.type == types.image) {
				var resultHtml = '<img src="' + subcontent.data.image + '"/>';
				cb(null, resultHtml);
				return;
			} else if(subcontent.type == types.menu) {
				mongoose.model('Menu').findById(subcontent.data.menu).exec(function(err, res) {
					if(err) {
						cb(err);
					} else if(!res) {
						var error = {
							code: 404,
							message: 'Document Not Found',
							additionalMessage: 'Document With _id ' + req.params.id + ' Not Found',
						};
						cb(error);
					} else {
						var menu = res;
						var context = {menu: menu, constants: constants};
						app.render(settings.template + '/' + subcontent.data.template,
							context, function(err, html) {
								if(err) {
									cb(err);
								} else if(!html) {
									var error = {
										code: 5009,
										message: 'express render failed without an error code!',
									};
									cb(error);
								} else {
									cb(null, html);
								}
							});
					}
				});
			}
		});
	};


	mongoose.model('SubContent', SubContentSchema, 'subcontents');
};