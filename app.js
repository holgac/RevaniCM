var express = require('express');
var http = require('http');
var path = require('path');
var async = require('async');
var config = require('./config');
var _ = require('underscore');


var mongoose = require('mongoose');

function loadModels(config) {
	require('./models/article')(config);
	require('./models/user')(config);
	require('./models/usergroup')(config);
	require('./models/category')(config);
	require('./models/settings')(config);
};

function connectMongoDB(config, callback) {
	mongoose.connect(config.mongodb_url+"/"+config.mongodb_database);
	var db = mongoose.connection;

	db.once('error', function(err) {
		console.error.bind(console, 'Mongodb connection error', err);
		callback(err, null);
	});
	db.once('open', function() {
		console.log("yay, mongodb is ok");
		callback(null, db);
	});
}

function startServer(config, mongodbConnection, settings) {
	var app = express();
	app.set('port', process.env.PORT || 3000);
	app.set('views', __dirname + '/views/' + config.template);
	app.set('view engine', 'jade');
	app.use(express.favicon());
	app.use(express.logger('dev'));
	app.use(express.bodyParser());
	var i18next = require('i18next');
	i18next.init();
	app.use(i18next.handle);
	i18next.registerAppHelper(app);
	i18next.init({ lng: 'en-US' });
	app.use(express.methodOverride());
	app.use(express.static(path.join(__dirname, 'public')));
	if ('development' == app.get('env')) {
		app.use(express.errorHandler());
	}
	app.use(express.cookieParser('keyboard cat'));
	app.use(express.session({ cookie: { maxAge: 1000*60*60*12 }}));

	var passport = require('passport');
	var passportLocal = require('passport-local').Strategy;
	passport.use(new passportLocal(
		function(username, password, done) {
			var User = mongodbConnection.model('User');
			console.log('try login: ' + username + ':' + password);
			User.findOne({ username: username }, function(err, user) {
				if (err) { return done(err); }
				if (!user) {
					console.log('no user');
					return done(null, false, { message: 'Incorrect username.' });
				}
				if (!user.validPassword(password)) {
					console.log('invalid pass');
					return done(null, false, { message: 'Incorrect password.' });
				}
				if(!user.active) {
					console.log('user inactive');
					return done(null, false, { message: 'User is not active.' });
				}
				console.log('login success!');
				return done(null, user);
			});
		}
	));
	app.use(passport.initialize());
	app.use(passport.session());
	app.use(app.router);
	passport.serializeUser(function(user, done) {
		done(null, user._id);
	});

	passport.deserializeUser(function(id, done) {
		var User = mongodbConnection.model('User');
		User.findById(id, function(err, user) {
			done(err, user);
		});
	});

	app.post('/adminlogin',
		passport.authenticate('local', { successRedirect: config.admin_url,
			failureRedirect: config.admin_url,
			failureFlash: false }));
	app.get('/adminlogout', function(req, res) {
		console.log('logging out!');
		req.logout();
		res.redirect('/admin');
	});

	http.createServer(app).listen(app.get('port'), function() {
	  console.log('Express server listening on port ' + app.get('port'));
	});
	var cmsRoutes = require('./routes/cms').views(config, mongodbConnection, settings);

	_.each(cmsRoutes, function(route, routeName) {
		if(routeName == 'index') {
			app.get('/', cmsRoutes.index);
		} else {
			app.get('/' + routeName, route);
		}
	});

	var adminRoutes = require('./routes/admin').views(config, mongodbConnection, settings);
	_.each(adminRoutes, function(route, routeName) {
		if(routeName == 'index') {
			app.get(config.admin_url, adminRoutes.index);
		} else {
			app.get(config.admin_url + routeName, route);
		}
	});
	var Restizer = require('./routes/restizer').restizer(config, mongodbConnection, settings);
	Restizer.restize(app, 'Article','article');
	Restizer.restize(app, 'User','user');
	Restizer.restize(app, 'UserGroup','usergroup');
	Restizer.restize(app, 'Category','category');
}

function Main(config) {
	// Perform initialization of required libraries such as mongodb
	async.parallel({
		mongodb: function(callback) {
			connectMongoDB(config, callback);
		}
	}, function(err, results) {
		if (err) {
			console.error('Error:', err);
			process.exit(1);
		}
		loadModels(config);
		var mongodbConnection = results.mongodb;
		var settings = require('./settings').settings(config, mongodbConnection);
		startServer(config, mongodbConnection, settings);
	});
}

// Main
Main(config);