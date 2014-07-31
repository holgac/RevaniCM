
var admin = function(config, mongodbConnection) {
	var self = this;
	return {
		index: function(req, res) {
			if(!req.user) {
				console.log('not logged in!');
				context = {
					version: config.version
				};
				res.render('adminlogin', context);
			} else {
				console.log('logged in!');
				context = {
					version: config.version
				};
				res.render('adminpanel', context);
			}
		},
		setup: function(req, res) {
			var User = mongodbConnection.model('User');
			User.find({}).limit(1).exec(function(err, doc) {
				if(doc.length != 0) {
					res.send(500, 'The server is already running!');
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

exports.views = function(config, mongodbConnection) {
	return new admin(config, mongodbConnection);
};