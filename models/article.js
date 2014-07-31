'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	ObjectId = Schema.Types.ObjectId;

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

	mongoose.model('Article', ArticleSchema, 'articles');
}