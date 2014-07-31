'use strict';

/**
 * Module dependencies.
 */
var crypto = require('crypto');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;

module.exports = function(config) {
	/**
	* User Schema
	*/
	var UserSchema = new Schema({
		username: {
			type: String
		},
		email: {
			type: String
		},
		password: {
			type: String
		},
		active: {
			type: Boolean
		},
		isAdmin: {
			type: Boolean
		},
		created: {
			type: Date
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

	mongoose.model('User', UserSchema, 'users');
}