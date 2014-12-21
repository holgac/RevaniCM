var constants = require('../constants');
var async = require('async');

var admin = function(config, mongodbConnection, settings) {
	var self = this;
	self.adminPanelDecorator = function(cb) {
		return function(req, res) {
			if(!req.user) {
				console.log('not logged in!');
				context = {
					version: config.version
				};
				res.render('revshine/adminlogin', context);
				return;
			}
			req.user.permissions(function(err, permissions) {
				if(err) {
					console.error(err);
					res.send(500, 'Internal Server Error 5000');
					return;
				}
				console.log('got permissions: ' + permissions);
				console.log('required: ' + constants.UserGroup.permissions.adminLogin);
				var result = (permissions & constants.UserGroup.permissions.adminLogin);
				console.log('got result: ' + result);
				if(!(permissions & constants.UserGroup.permissions.adminLogin)) {
					res.redirect('/');
					return;
				}
				settings.get(function(err, settingsInstance) {
					if(err) {
						console.error(err);
						res.send(500, 'Internal Server Error 5001');
						return;
					}
					cb(req, res, settingsInstance);
				});
			});
		}
	};
	self.createView = function(viewName) {
		return function(req, res, settings) {
			context = {
				version: config.version,
				settings: settings
			};
			// TODO: temporarily hard coded, will be changed with the template system
			res.render('revshine/'+viewName, context);
		}
	}
	self.createAdminView = function(viewName) {
		return self.adminPanelDecorator(self.createView(viewName));
	}
	return {
		index: self.createAdminView('adminpanel'),
		home: self.createAdminView('adminhome'),
		editarticle: self.createAdminView('admineditarticle'),
		viewarticles: self.createAdminView('adminviewarticles'),
		viewusers: self.createAdminView('adminviewusers'),
		edituser: self.createAdminView('adminedituser'),
		viewusergroups: self.createAdminView('adminviewusergroups'),
		editusergroup: self.createAdminView('admineditusergroup'),
		viewcategories: self.createAdminView('adminviewcategories'),
		editcategory: self.createAdminView('admineditcategory'),
		viewsubcontents: self.createAdminView('adminviewsubcontents'),
		editsubcontent: self.createAdminView('admineditsubcontent'),
		viewmenus: self.createAdminView('adminviewmenus'),
		editmenu: self.createAdminView('admineditmenu'),
		selectarticle: self.createAdminView('adminselectarticle'),
		selectcategory: self.createAdminView('adminselectcategory'),
		selectmenu: self.createAdminView('adminselectmenu'),
		setup: function(req, res) {
			var User = mongodbConnection.model('User');
			var UserGroup = mongodbConnection.model('UserGroup');
			User.find({}).limit(1).exec(function(err, doc) {
				if(doc.length != 0) {
					res.send(500, 'The server is already set up!');
					return;
				}
				console.log('starting waterfall!');
				async.waterfall([
					function(cb) {
						UserGroup.remove({}, function(err) {
							console.log('removed usergroups');
							cb(err);
						});
					},
					function(cb) {
						var testUserGroup = new UserGroup({
							name: 'Super Users',
							permissions: 0xFFFFFFFF
						});
						testUserGroup.save(function(err, res) {
							console.log('created usergroup');
							cb(err, res)
						});
					},
					function(userGroup, cb) {
						var testUser = new User({
							name: 'Super User',
							username: 'admin',
							email:'admin@qwer.ty',
							created: new Date(),
							active: true,
							groups: [userGroup._id]
						});
						testUser.setPassword('qwer');
						testUser.save(function(err, res) {
							console.log('created user');
							cb(err);
						});
					}
				], function(err) {
					if(err) {
						console.error(err);
						res.send(500, 'Internal Server Error 5000');
						return;
					}
					res.send('success!');
				});
			});
		}
	};
};

exports.views = function(config, mongodbConnection, settings) {
	return new admin(config, mongodbConnection, settings);
};