'use strict';

/**
 * Module dependencies.
 */
var crypto = require('crypto');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var _ = require('underscore');
var constants = require('../constants');
var Mixed = Schema.Types.Mixed;

module.exports = function(config) {
	/**
	* Log Schema
	*/
	var LogSchema = new Schema({
		// severity of the log in range of [1,5]
		severity: {
			type: Number
		},
		// base log type
		baseType: {
			type: String
		},
		// log type
		type: {
			type: String,
			required: true
		},
		// log content i.e message
		content: {
			type: String
		},
		// time of the log
		date: {
			type: Date
		},
		// additional data such as client ip, user id etc.
		additionalData: {
			type: Mixed
		},
	});

	mongoose.model('Log', LogSchema, 'logs');
}