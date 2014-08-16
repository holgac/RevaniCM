'use strict';

/**
 * Module dependencies.
 */
var crypto = require('crypto');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var _ = require('underscore');
var constants = require('../constants');

module.exports = function(config) {
	/**
	* User Schema
	*/
	var UserSchema = new Schema({
		// Name of the user, can be anything, not necessarily unique
		name: {
			type: String
		},
		// login name, unique
		username: {
			type: String,
			required: true
		},
		// email, should be unique and in email format
		email: {
			type: String
		},
		// unsalted sha1 password
		password: {
			type: String
		},
		// creation/register date
		created: {
			type: Date
		},
		// last login date
		lastVisit: {
			type: Date
		},
		// can the user log in?
		active: {
			type: Boolean
		},
		// user groups, array of UserGroup _id.
		groups: {
			type: Array
		}
	});
	UserSchema.methods.setPassword = function(passwd) {
		var hash = crypto.createHash('sha1');
		hash.update(passwd);
		this.password = hash.digest('hex');
	};
	UserSchema.methods.validPassword = function(passwd) {
		var hash = crypto.createHash('sha1');
		hash.update(passwd);
		return(this.password == hash.digest('hex'));
	};
	// TODO: Use a redis server or equivalent to 
	// store permissions of users. These entries
	// should update when a user is logged in
	// It's even beter to create a temporary key in
	// redis server that stores permission of the user
	// of current session and store that in session
	UserSchema.methods.permissions = function(cb) {
		var self = this;
		var UserGroup = mongoose.model('UserGroup');
		UserGroup.find({_id:{$in:self.groups}}, function(err, res) {
			if(err) {
				cb(err);
				return;
			}
			var permission = 0;
			_.each(res, function(userGroup) {
				permission |= userGroup.permissions;
			});
			cb(null, permission);
		});
	};
	UserSchema.statics.canAddDocument = function(body, user, settings, cb) {
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
			var permCode = constants.UserGroup.permissions.addUser;
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
	UserSchema.statics.jsonizeDocuments = function(instances, requestedFields, user, cb) {
		var fields = ['_id', 'name', 'username', 'email', 'created', 'active', 'groups'];
		if(requestedFields !== null) {
			fields = _.intersection(fields, requestedFields);
		}
		var jsonized = _.map(instances, function(instance) {
			return _.pick(instance, fields);
		});
		cb(null, jsonized);
	};

	UserSchema.statics.createDocument = function(body, user, settings, cb) {
		var User = mongoose.model('User');
		var user = new User(body);
		user.created = new Date();
		cb(null, user);
	};
	mongoose.model('User', UserSchema, 'users');
}