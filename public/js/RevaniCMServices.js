'use strict';

var RevaniCMServices = angular.module('RevaniCM.services', []);

RevaniCMServices.factory('documentCache', ['$http', function($http) {
	var self = this;
	// cache = [anyDocument, ...]
	self.cache = [];
	// cacheMap[collectionName][id] = index of document in self.cache[collectionName]
	self.cacheMap = {};
	// requestCache[collectionName] = [requestedDocumentId, ...]
	self.requestCache = {};
	self.processRequests = _.debounce(function() {
		console.log('processing requests');
		var oldRequestCache = self.requestCache;
		self.requestCache = {};
		_.each(oldRequestCache, function(idList, collectionName) {
			var ids = '';
			_.each(idList, function(id) {
				ids += id + ',';
			});
			ids = ids.substr(0, ids.length-1);
			var url = '/' + collectionName + '/?ids=' + ids;
			$http.get(url).success(function(data) {
				_.each(data.elements, function(element) {
					self.cache.push(element);
					if(self.cacheMap[collectionName] === undefined) {
						self.cacheMap[collectionName] = {};
					}
					self.cacheMap[collectionName][element._id] = self.cache.length-1;
				});
			});
		});
	}, 250);

	self.get = function(collectionName, id) {
		if(self.cacheMap[collectionName] !== undefined && self.cacheMap[collectionName][id] !== undefined) {
			return self.cache[self.cacheMap[collectionName][id]];
		}
		if(self.requestCache[collectionName] === undefined) {
			self.requestCache[collectionName] = [];
		}
		var idx = _.indexOf(self.requestCache[collectionName], id);
		if(idx === -1) {
			self.requestCache[collectionName].push(id);
			self.cache.push(null);
			if(self.cacheMap[collectionName] === undefined) {
				self.cacheMap[collectionName] = {};
			}
			self.cacheMap[collectionName][id] = self.cache.length-1;
			self.processRequests();
		}
		return null;
	};
	return {
		get: self.get
	};
}]);


RevaniCMServices.factory('translationCache', ['$http', function($http) {
	var self = this;
	// cacheMap[key] = value (translation of key)
	self.cacheMap = {};
	// requestCache[key] = true if requested
	self.requestCache = {};
	self.processRequests = _.debounce(function() {
		console.log('processing requests');
		var oldRequestCache = self.requestCache;
		self.requestCache = {};
		var keys = '';
		_.each(oldRequestCache, function(trueVal, key) {
			keys += key + ',';
		});
		keys = keys.substr(0, keys.length-1);
		var url = '/translate/?keys=' + keys;
		$http.get(url).success(function(data) {
			_.each(data, function(value, key) {
				self.cacheMap[key] = value;
			});
		});
	}, 250);

	self.get = function(key) {
		console.log('requested ' + key);
		if(self.cacheMap[key] !== undefined) {
			return self.cacheMap[key];
		}
		if(self.requestCache[key] === undefined) {
			self.requestCache[key] = true;
			self.cacheMap[key] = '---';
			self.processRequests();
		}
		return null;
	};
	return {
		get: self.get
	};
}]);