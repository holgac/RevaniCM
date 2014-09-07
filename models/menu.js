'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;
var _ = require('underscore');
var constants = require('../constants');

module.exports = function(config) {
	/**
	* Menu Schema
	*/
	var MenuSchema = new Schema({
		// Name of the menu, unique.
		name: {
			type: String
		},
		// array of sub menus
		// 	SubMenu structure:
		// 		name: submenu name (title, as shown to user)
		// 		type: submenu type. Defined in constants.Menu.types
		// 		data: additional data depending on submenu type
		subMenus: {
			type: Array
		}
	});

	MenuSchema.statics.canAddDocument = function(body, user, settings, cb) {
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
			var permCode = constants.UserGroup.permissions.editMenu;
			if(permissions & permCode) {
				// TODO: check for name conflicts
				cb();
			} else {
				cb({
					message: 'Unauthorized',
					code: 5002
				});
			}
		});
	};
	MenuSchema.statics.jsonizeDocuments = function(instances, requestedFields, user, cb) {
		var fields = ['_id', 'name','subMenus'];
		if(requestedFields !== null) {
			fields = _.intersection(fields, requestedFields);
		}
		var jsonized = _.map(instances, function(instance) {
			return _.pick(instance, fields);
		});
		cb(null, jsonized);
	};
	mongoose.model('Menu', MenuSchema, 'menus');
};