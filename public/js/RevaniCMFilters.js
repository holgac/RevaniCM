'use strict';

/* Directives */


var RevaniCMFilters = angular.module('RevaniCM.filters', []);

RevaniCMFilters.filter('time', function() {
	return function(input) {
		if(input == null) {
			return '---';
		}
		return moment(input).format('HH:mm');
	}
});
