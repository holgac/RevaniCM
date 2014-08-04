'use strict';

/**
 * Module dependencies.
 */
var crypto = require('crypto');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var _ = require('underscore');

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

	mongoose.model('User', UserSchema, 'users');
}