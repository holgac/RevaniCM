'use strict';

// Declare app level module which depends on filters, and services
var RevCMS = angular.module('RevCMS', [
	'ngRoute',
	'ui.bootstrap',
	'RevCMS.controllers',
]);

RevCMS.config(['$routeProvider', function($routeProvider) {
	$routeProvider
		.when('/', {
				templateUrl: 'homepage',
				controller: 'ArticlesController'
		})
		.otherwise({
				redirectTo: '/'
		});
}]);
