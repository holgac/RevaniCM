'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	ObjectId = Schema.Types.ObjectId,
	sanitizeHtml = require('sanitize-html');

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
	ArticleSchema.statics.canAddDocument = function(body, settings, cb) {
		if(body.title == undefined || body.title.length == 0) {
			cb({
				message: 'title is empty',
				code: 5004
			});
			return;
		}
		if(body.content == undefined || body.content.length == 0) {
			cb({
				message: 'title is empty',
				code: 5004
			});
			return;
		}
		cb();
	};

	ArticleSchema.statics.sanitizeDocument = function(instance, settings, cb) {
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