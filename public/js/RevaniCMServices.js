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