'use strict';

/**
 * Module dependencies.
 */
var _ = require('underscore');
var mongoose = require('mongoose');
var async = require('async');
var constants = require('../constants');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;

module.exports = function(config) {
	/**
	* Category Schema
	*/
	var CategorySchema = new Schema({
		name: {
			type: String
		},
		description: {
			type: String
		},
		// this field is not to be manipulated by the client via regular put method
		parent: {
			// foreign key to Category
			type: ObjectId
		},
		// array of ObjectId that are foreign keys to the Categories
		// those categories' parents are this Category.
		// this field is not to be manipulated by the client.
		children: {
			type: Array
		},
		// array of ObjectId that are foreign keys to the Categories
		// those categories' ancestors are this Category.
		// this field is not to be manipulated by the client.
		// we chose to precalculate descendants since categories
		// are more requested than altered.
		descendants: {
			type: Array
		}
	});

	CategorySchema.statics.canAddDocument = function(body, user, settings, cb) {
		if(body.name == undefined || body.name.length == 0) {
			cb({
				message: 'Name is empty',
				code: 5004
			});
			return;
		}
		async.waterfall([
			function(cb) {
				if(!user) {
					cb({
						message: 'Unauthorized',
						code:5002
					});
				} else {
					user.permissions(function(err, permissions) {
						if(err) {
							cb(err);
						} else {
							var permCode = constants.UserGroup.permissions.editCategory;
							if(permissions & permCode) {
								cb();
							} else {
								cb({
									message: 'Unauthorized',
									code: 5002
								});
							}
						}
					});
				}
			},
			function(cb) {
				var Category = mongoose.model('Category');
				Category.findOne({name:body.name}, function(err, res) {
					if(err) {
						cb(err)
					} else if(res) {
						cb({
							message: 'Category already exists',
							code: 5006
						});
					}
					cb(err);
				});
			}
		], function(err) {
			cb(err);
		});
	};
	CategorySchema.statics.instanceMethods = function() {
		return ['setParent'];
	};

	CategorySchema.methods.setParent = function(request, user, cb) {
		var self = this;
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
			var permCode = constants.UserGroup.permissions.editCategory;
			if(!(permissions & permCode)) {
				cb({
					message: 'Unauthorized',
					code: 5002
				});
				return;
			}
			var oldParentId = self.parent;
			var newParentId = request.body.parent;
			var Category = mongoose.model('Category');
			var waterfallMethods = [];
			var editDescendants = function(categoryId, add, editChildren, cb) {
				Category.findById(categoryId, function(err, category) {
					if(err) {
						cb(err);
						return;
					} else if(category == null) {
						cb({
							message: 'Category not found',
							code: 5007
						});
						return;
					}
					if(add) {
						if(editChildren) {
							category.children.push(self._id);
						}
						category.descendants.push(self._id);
					} else {
						if(editChildren) {
							category.children = _.without(category.children, self._id);
						}
						category.descendants = _.without(category.descendants, self._id);
					}
					category.save(function(err, res) {
						if(err) {
							// TODO: these errors leave the DB in inconsistent state,
							// handle errors, maybe roll back actions,
							// or recalculate descendants
							cb(err);
							return;
						}
						if(category.parent != null) {
							editDescendants(category.parent, add, false, cb);
						} else {
							cb();
						}
					});
				});
			}
			if(newParentId != null) {
				waterfallMethods.push(function(cb) {
					editDescendants(newParentId, true, true, cb);
				});
			}
			if(oldParentId != null) {
				waterfallMethods.push(function(cb) {
					editDescendants(oldParentId, false, true, cb);
				});
			}
			waterfallMethods.push(function(cb) {
				self.parent = newParentId;
				self.save(function(err, res) {
					cb(err);
				});
			});
			async.waterfall(waterfallMethods, function(err) {
				if(err) {
					// TODO: since we are setting the parent of 'this' after
					// descendant-children calculation, an error means that
					// this category's parent is unchanged. category
					// parents are valid in this state, but descendants
					// are not. recalculate here.
				}
				cb(err, {success:true});
			});
		});
	};
	mongoose.model('Category', CategorySchema, 'categories');
}