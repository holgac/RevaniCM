'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	ObjectId = Schema.Types.ObjectId;

module.exports = function(config) {
	/**
	* Settings Schema
	*
	* Settings refer to the per-website (cms) settings.
	*/
	var SettingsSchema = new Schema({
		title: {
			type: String
		},
		subtitle: {
			type: String
		},
		articleShortContentMaxSize: {
			type: Number
		},
		comments: {
			enabled: {
				type: Boolean,
				default: true
			},
			anonymous: {
				type: Boolean,
				default: true
			}
		},
		template: {
			type: String
		}
	});

	mongoose.model('Settings', SettingsSchema, 'settings');
}