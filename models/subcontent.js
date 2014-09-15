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
			2: ['image']
		};
		instance.data = _.pick(instance.data, dataFields[instance.type]);
		cb(null, instance);
	};

	SubContentSchema.statics.staticMethods = function() {
		return ['at'];
	};

	SubContentSchema.statics.at = function(request, user, cb) {
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
			var result = null;
			if(results.length == 0) {
				cb({
					message: 'SubContent not found!',
					code: 404
				});
				return;
			}
			result = results[0];
			var types = constants.SubContent.types;
			// TODO: warning log if results.size > 1
			if(result.type == types.text) {
				cb(null, result.data.text);
				return;
			} else if(result.type == types.image) {
				var resultHtml = '<img src="' + result.data.image + '"/>';
				cb(null, resultHtml);
				return;
			}
		});
	};


	mongoose.model('SubContent', SubContentSchema, 'subcontents');
};