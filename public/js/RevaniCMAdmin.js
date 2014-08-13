'use strict';

// Declare app level module which depends on filters, and services
var RevaniCMAdmin = angular.module('RevaniCMAdmin', [
	'ngRoute',
	'ui.bootstrap',
	'RevaniCMAdmin.controllers',
	'RevaniCM.filters',
	'RevaniCM.services',
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
		.when('/editarticle', {
				templateUrl: 'admineditarticle',
				controller: 'EditArticleController'
		})
		.when('/viewarticles', {
				templateUrl: 'adminviewarticles',
				controller: 'ViewArticlesController'
		})
		.when('/viewusers', {
				templateUrl: 'adminviewusers',
				controller: 'ViewUsersController'
		})
		.when('/edituser', {
				templateUrl: 'adminedituser',
				controller: 'EditUserController'
		})
		.when('/edituser/:userId', {
				templateUrl: 'adminedituser',
				controller: 'EditUserController'
		})
		.otherwise({
				redirectTo: '/'
		});
}]);
