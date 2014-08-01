'use strict';

// Declare app level module which depends on filters, and services
var RevaniCMAdmin = angular.module('RevaniCMAdmin', [
	'ngRoute',
	'ui.bootstrap',
	'RevaniCMAdmin.controllers',
]);

RevaniCMAdmin.config(['$routeProvider', function($routeProvider) {
	$routeProvider
		.when('/', {
				templateUrl: 'adminhome',
				// controller: 'ArticlesController'
		})
		.when('/editarticle/:articleId', {
				templateUrl: 'admineditarticle',
				controller: 'EditArticleController'
		})
		.when('/addarticle', {
				templateUrl: 'admineditarticle',
				controller: 'EditArticleController'
		})
		.when('/viewarticles', {
				templateUrl: 'adminviewarticles',
				controller: 'ViewArticlesController'
		})
		.otherwise({
				redirectTo: '/'
		});
}]);
