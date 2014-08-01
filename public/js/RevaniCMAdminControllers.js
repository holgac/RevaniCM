var RevaniCMAdminControllers = angular.module('RevaniCMAdmin.controllers', ['textAngular']);

RevaniCMAdminControllers.controller('EditArticleController', ['$scope', '$timeout',
	'$http', '$rootScope', '$routeParams', '$location',
	function($scope, $timeout, $http, $rootScope, $routeParams, $location) {
		if($routeParams.articleId) {

		} else {
			$scope.article = {
				title:'Test Title',
				content:'Test Content'
			};
		}
		$scope.save = function() {
			if($scope.article._id !== undefined) {
			} else {
				$http.post('/article', _.pick($scope.article, 'title', 'content')).success(function(data) {
					if(data.success === true) {
						$location.url('/viewarticles');
					}
				});
			}
		}
}]);

RevaniCMAdminControllers.controller('ViewArticlesController', ['$scope', '$timeout',
	'$http', '$rootScope', '$routeParams', '$location',
	function($scope, $timeout, $http, $rootScope, $routeParams, $location) {
		$scope.articles = [];
		$http.get('/article').success(function(data) {
			$scope.articles = data.elements;
		});
}]);