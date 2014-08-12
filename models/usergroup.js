'use strict';

/**
 * Module dependencies.
 */
var crypto = require('crypto');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;
var _ = require('underscore');
var constants = require('../constants');

module.exports = function(config) {
	/**
	* UserGroup Schema
	*/
	var UserGroupSchema = new Schema({
		// Name of the user group, unique
		name: {
			type: String
		},
		// A bitwise permission list.
		//   permission types and values are defined in
		//   root/constants.js in UserGroup.permissions
		//   
		//   TODO: change to string or find more elegant way.
		permissions: {
			type: Number,
			default: 0
		},
		parent: {
			type: ObjectId,
			default: null
		}
	});

	UserGroupSchema.statics.canAddDocument = function(body, user, settings, cb) {
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
			var permCode = constants.UserGroup.permissions.superAdmin;
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
	UserGroupSchema.statics.jsonizeDocuments = function(instances, requestedFields, user, cb) {
		var fields = ['_id', 'name','parent', 'permissions'];
		if(requestedFields !== null) {
			fields = _.intersection(fields, requestedFields);
		}
		var jsonized = _.map(instances, function(instance) {
			return _.pick(instance, fields);
		});
		cb(null, jsonized);
	};
	mongoose.model('UserGroup', UserGroupSchema, 'usergroups');
}