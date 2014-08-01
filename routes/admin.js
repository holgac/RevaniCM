var admin = function(config, mongodbConnection, settings) {
	var self = this;
	self.adminPanelDecorator = function(cb) {
		return function(req, res) {
			if(!req.user) {
				console.log('not logged in!');
				context = {
					version: config.version
				};
				res.render('adminlogin', context);
				return;
			}
			if(!req.user.isAdmin) {
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
		}
	};
	self.index = function(req, res, settings) {
		context = {
			version: config.version,
			settings: settings
		};
		res.render('adminpanel', context);
	};
	self.adminhome = function(req, res, settings) {
		context = {
			version: config.version,
			settings: settings
		};
		res.render('adminhome', context);
	};
	self.admineditarticle = function(req, res, settings) {
		context = {
			version: config.version,
			settings: settings
		};
		res.render('admineditarticle', context);
	};
	self.adminviewarticles = function(req, res, settings) {
		context = {
			version: config.version,
			settings: settings
		};
		res.render('adminviewarticles', context);
	};
	return {
		index: self.adminPanelDecorator(self.index),
		adminhome: self.adminPanelDecorator(self.adminhome),
		admineditarticle: self.adminPanelDecorator(self.admineditarticle),
		adminviewarticles: self.adminPanelDecorator(self.adminviewarticles),
		setup: function(req, res) {
			var User = mongodbConnection.model('User');
			User.find({}).limit(1).exec(function(err, doc) {
				if(doc.length != 0) {
					res.send(500, 'The server is already set up!');
					return;
				}
				var testUser = new User({
					username:'admin',
					email:'admin@qwer.ty',
					active:true,
					isAdmin:true,
					created:new Date()
				});
				testUser.setPassword('qwer');
				testUser.save(function(err, doc) {
					res.send('success!');
				});
			});
		}
	};
};

exports.views = function(config, mongodbConnection, settings) {
	return new admin(config, mongodbConnection, settings);
};