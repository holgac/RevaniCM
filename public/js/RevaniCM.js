'use strict';

// Declare app level module which depends on filters, and services
var RevaniCM = angular.module('RevaniCM', [
	'ngRoute',
	'ui.bootstrap',
	'RevaniCM.controllers',
	'RevaniCM.services',
	'RevaniCM.filters',
]);

RevaniCM.config(['$routeProvider', function($routeProvider) {
	$routeProvider
		.when('/', {
				templateUrl: 'homepage',
				controller: 'ArticlesController'
		})
		.when('/article/:articleId', {
				templateUrl: 'homepage',
				controller: 'ArticleController'
		})
		.otherwise({
				redirectTo: '/'
		});
}]);
