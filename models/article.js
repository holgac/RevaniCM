'use strict';

/**
 * Module dependencies.
 */
var _ = require('underscore');
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
		},
		/**
		 * A date-sorted array that stores the given comments in the following Comment form:
		 *  _id: ObjectId (unique)
		 *  ip: String
		 * 	date: Date (comment date)
		 * 	author: String (author name, if anonymous)
		 * 	email: String (author email, if anonymous, optional)
		 * 	title: String (comment title, optional)
		 * 	content: String (comment body)
		 * 	user: ObjectId (foreign key to User, if logged in)
		 * 	notifyme: Boolean (notification request whenever a new comment is added)
		 * @type Comment
		 */
		comments: {
			type: Array
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
	ArticleSchema.statics.createDocument = function(body, user, settings, cb) {
		var Article = mongoose.model('Article');
		var article = new Article(body);
		article.creator = user._id;
		article.created = new Date();
		cb(null, article);
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

	ArticleSchema.statics.jsonizeDocuments = function(instances, requestedFields, user, cb) {
		var fields = ['_id', 'title', 'content', 'contentShort', 'creator', 'created', 'comments', 'commentCount'];
		if(requestedFields !== null) {
			fields = _.intersection(fields, requestedFields);
		}
		var commentCountRequested = _.contains(fields, 'commentCount');
		var commentsRequested = _.contains(fields, 'comments');
		var commentFields = ['_id', 'title', 'user', 'content','date', 'author'];
		var jsonized = _.map(instances, function(instance) {
			var obj = _.pick(instance, fields);
			if(commentsRequested) {
				// TODO: paginate comments
				obj.comments = _.map(obj.comments, function(comment) {
					return _.pick(comment, commentFields);
				})
			}
			if(commentCountRequested) {
				obj.commentCount = 0;
				if(instance.comments !== undefined) {
					obj.commentCount = instance.comments.length;
				}
			}
			return obj;
		});
		cb(null, jsonized);
	};


	ArticleSchema.statics.instanceMethods = function() {
		return ['addComment'];
	};

	ArticleSchema.methods.addComment = function(request, user, cb) {
		var self = this;
		var requestBody = request.body;
		// TODO: requestBody may be something like this:
		// {
		// 	content: {
		// 		length: 1,
		// 		injectedData: ...
		// 	}
		// }
		// This is not a malformed request, it's an open injection attempt.
		// Although this is not a security issue, it should be fixed nonetheless.
		if(requestBody.content == undefined || requestBody.content.length == 0
			|| (user == undefined && (requestBody.author == undefined || requestBody.author.length == 0))) {
			cb({
				message: 'Malformed Request',
				additionalMessage: requestBody,
				code: 5005
			});
			return;
		}
		var isStringOrUndefined = function(val) {
			return (val === undefined || typeof(val) == typeof(''));
		}
		var hasErrors = false;
		_.each([requestBody.content, requestBody.author, requestBody.title, requestBody.email], function(val) {
			if(!isStringOrUndefined(val)) {
				hasErrors = true;
			}
		});
		if(hasErrors) {
			var logger = require('../logger').logger();
			logger.log('InjectionAttempt', 'Article.AddComment', '', requestBody, request);
			cb({
				code: 5005
				message: 'Malformed Request',
				additionalMessage: requestBody;
			});
			return;
		}

		if(self.comments === undefined) {
			self.comments = [];
		}
		var comment = {
			_id: mongoose.Types.ObjectId(),
			ip: request.connection.remoteAddress,
			content: requestBody.content,
			date: new Date(),
			title: requestBody.title
		};
		if(user) {
			comment.user = user._id;
		} else {
			comment.author = requestBody.author;
			if(requestBody.email) {
				comment.email = requestBody.email;
				if(requestBody.notifyme) {
					comment.notifyme = true;
				}
			}
		}
		self.comments.push(comment);
		// TODO: send mail to comments with 'notifyme' field
		// this can be abused since email address is not validated.
		// maybe we should enable it only for users
		self.save(function(err, res) {
			if(err) {
				cb(err);
				return;
			}
			cb(null, {success:true});
		});
	};
	mongoose.model('Article', ArticleSchema, 'articles');
}