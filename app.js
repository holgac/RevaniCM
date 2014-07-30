var express = require('express'),
	http = require('http'),
	path = require('path'),
	async = require('async'),
	config = require('./config');


var mongoose = require('mongoose');

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

function startServer(config, mongodbConnection) {
	var app = express();
	app.set('port', process.env.PORT || 3000);
	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
	app.use(express.favicon());
	app.use(express.logger('dev'));
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(app.router);
	app.use(express.static(path.join(__dirname, 'public')));
	if ('development' == app.get('env')) {
		app.use(express.errorHandler());
	}
	http.createServer(app).listen(app.get('port'), function(){
	  console.log('Express server listening on port ' + app.get('port'));
	});
	var cmsRoutes = require('./routes/cms').views(config, mongodbConnection);
	app.get('/', cmsRoutes.index);
}

function Main(config) {
	// Connect to MongoDB and prepare mixer rpc in parallel
	async.parallel({
		mongodb: function(callback) {
			connectMongoDB(config, callback);
		}
	}, function(err, results) {
		if (err) {
			console.error('Error:', err);
			process.exit(1);
		}
		var mongodbConnection = results.mongodb;
		startServer(config, mongodbConnection);
	});
}

// Main
Main(config);