'use strict';

// Declare app level module which depends on filters, and services
var RevaniCM = angular.module('RevaniCM', [
	'ngRoute',
	'ui.bootstrap',
	'RevaniCM.controllers',
]);

RevaniCM.config(['$routeProvider', function($routeProvider) {
	$routeProvider
		.when('/', {
				templateUrl: 'homepage',
				controller: 'ArticlesController'
		})
		.otherwise({
				redirectTo: '/'
		});
}]);