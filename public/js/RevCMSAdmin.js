'use strict';

// Declare app level module which depends on filters, and services
var RevCMSAdmin = angular.module('RevCMSAdmin', [
	'ngRoute',
	'ui.bootstrap',
	'RevCMSAdmin.controllers',
]);

RevCMSAdmin.config(['$routeProvider', function($routeProvider) {
	$routeProvider
		.when('/', {
				templateUrl: 'adminhome',
				// controller: 'ArticlesController'
		})
		.otherwise({
				redirectTo: '/'
		});
}]);
