var url = require('url');
var sanitizeHtml = require('sanitize-html');

var article = function(config, mongodbConnection, settings) {
	var self = this;
	var Article = mongodbConnection.model('Article');
	self.articleDecorator = function(requireAdmin, cb) {
		return function(req, res) {
			if(requireAdmin && (!req.user || !req.user.isAdmin)) {
				console.log('not logged in or is not admin!');
				res.send(500, 'Internal Server Error 5002')
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
	self.add = function(req, res, settings) {
		if(req.body.title == undefined || req.body.title.length == 0) {
			// TODO: translate error strings
			res.json({success:false, error:'title is empty'});
			return;
		}
		if(req.body.content == undefined || req.body.content.length == 0) {
			// TODO: translate error strings
			res.json({success:false, error:'content is empty'});
			return;
		}
		var title = sanitizeHtml(req.body.title, {
			allowedTags: [],
			allowedAttributes: {},
			allowedSchemes: []
		});
		var content = req.body.content;
		var contentShort = sanitizeHtml(content, {
			allowedTags: ['b','u','i'],
			allowedAttributes: {
			},
			allowedSchemes: []
		});
		if(contentShort.length > settings.articleShortContentMaxSize) {
			contentShort = contentShort.substr(0, settings.articleShortContentMaxSize-3);
			contentShort += '...';
		}
		var articleInstance = new Article({
			title:title,
			content:content,
			contentShort:contentShort,
			creator:req.user._id,
			created: new Date()
		});
		articleInstance.save(function(err, doc) {
			if(err) {
				res.send(500, 'Internal Server Error 5000');
				return;
			}
			res.json({success:true, element:doc});
		});
	};
	self.get = function(req, res, settings) {
		var query = url.parse(req.url, true).query;
		var premise = Article.find({});
		if(query.skip !== undefined) {
			if(isNaN(query.skip)) {
				res.send(500, 'Internal Server Error 5003');
				return;
			}
			premise.skip(query.skip);
		}
		if(query.limit !== undefined) {
			if(isNaN(query.limit)) {
				res.send(500, 'Internal Server Error 5003');
				return;
			}
			premise.limit(query.limit);
		}
		premise.exec(function(err, docs) {
			// TODO: do not send all fields?
			res.json({success:true, elements:docs});
		});
	};
	self.getOne = function(req, res, settings) {
		var query = url.parse(req.url, true).query;
		var premise = Article.findById(req.params.id);
		premise.exec(function(err, doc) {
			if(err) {
				console.error(err);
				res.send(500, 'Internal Server Error 5000');
				return;
			}
			if(!doc) {
				res.send(404, 'Not Found');
			} else {
				res.json({success:true, element:doc});
			}
		});
	};
	return {
		add:self.articleDecorator(true, self.add),
		get:self.articleDecorator(false, self.get),
		getOne:self.articleDecorator(false, self.getOne)
	};
};

exports.views = function(config, mongodbConnection, settings) {
	return new article(config, mongodbConnection, settings);
};