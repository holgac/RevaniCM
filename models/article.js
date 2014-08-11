'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose');
var sanitizeHtml = require('sanitize-html');
var constants = require('../constants');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;

module.exports = function(config) {
	/**
	* Article Schema
	*/
	var ArticleSchema = new Schema({
		title: {
			type: String
		},
		content: {
			type: String
		},
		contentShort: {
			type: String
		},
		creator: {
			// foreign key to User
			type: ObjectId
		},
		created: {
			type: Date
		}
	});
	ArticleSchema.statics.canAddDocument = function(body, user, settings, cb) {
		if(body.title == undefined || body.title.length == 0) {
			cb({
				message: 'title is empty',
				code: 5004
			});
			return;
		}
		if(body.content == undefined || body.content.length == 0) {
			cb({
				message: 'content is empty',
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
			var permCode = constants.UserGroup.permissions.addContent;
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

	ArticleSchema.statics.sanitizeDocument = function(instance, user, settings, cb) {
		instance.title = sanitizeHtml(instance.title, {
			allowedTags: [],
			allowedAttributes: {},
			allowedSchemes: []
		});
		instance.contentShort = sanitizeHtml(instance.content, {
			allowedTags: ['b','u','i'],
			allowedAttributes: {
			},
			allowedSchemes: []
		});
		if(instance.contentShort.length > settings.articleShortContentMaxSize) {
			instance.contentShort = instance.contentShort.substr(0, settings.articleShortContentMaxSize-3);
			instance.contentShort += '...';
		}
		cb(null, instance);
	};
	mongoose.model('Article', ArticleSchema, 'articles');
}