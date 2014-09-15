'use strict';

var RevaniCMFilters = angular.module('RevaniCM.filters', []);

RevaniCMFilters.filter('time', function() {
	return function(input) {
		if(input == null) {
			return '---';
		}
		return moment(input).format('HH:mm');
	};
});

RevaniCMFilters.filter('cachedDocument', ['$http', 'documentCache', function($http, documentCache) {
	return function(id, collectionName, field) {
		if(id === undefined) {
			return '---';
		}
		var doc = documentCache.get(collectionName, id);
		if(doc !== null) {
			return doc[field];
		} else {
			return '---';
		}
	};
}]);

RevaniCMFilters.filter('translate', ['$http', 'translationCache', function($http, translationCache) {
	return function(key) {
		if(key === undefined) {
			return '---';
		}
		var value = translationCache.get(key);
		if(value !== null) {
			return value;
		} else {
			return key;
		}
	};
}]);