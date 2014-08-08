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

	mongoose.model('UserGroup', UserGroupSchema, 'usergroups');
}