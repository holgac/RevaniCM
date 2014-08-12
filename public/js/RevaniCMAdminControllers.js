var RevaniCMAdminControllers = angular.module('RevaniCMAdmin.controllers', ['textAngular']);

RevaniCMAdminControllers.controller('EditArticleController', ['$scope', '$timeout',
	'$http', '$rootScope', '$routeParams', '$location',
	function($scope, $timeout, $http, $rootScope, $routeParams, $location) {
		if($routeParams.articleId) {
			$http.get('/article/' + $routeParams.articleId).success(function(data) {
				$scope.article = data.element;
			});
		} else {
			$scope.article = {
				title:'Test Title',
				content:'Test Content'
			};
		}
		$scope.save = function() {
			if($scope.article._id !== undefined) {
				$http.put('/article/' + $scope.article._id, _.pick($scope.article, ['title', 'content'])).success(function(data) {
					if(data.success === true) {
						$location.url('/viewarticles');
					}
				});
			} else {
				$http.post('/article', _.pick($scope.article, ['title', 'content'])).success(function(data) {
					if(data.success === true) {
						$location.url('/viewarticles');
					}
				});
			}
		};
}]);

RevaniCMAdminControllers.controller('ViewArticlesController', ['$scope', '$timeout',
	'$http', '$rootScope', '$routeParams', '$location',
	function($scope, $timeout, $http, $rootScope, $routeParams, $location) {
		$scope.articles = [];
		$http.get('/article').success(function(data) {
			$scope.articles = data.elements;
		});
}]);

RevaniCMAdminControllers.controller('EditUserController', ['$scope', '$timeout',
	'$http', '$rootScope', '$routeParams', '$location',
	function($scope, $timeout, $http, $rootScope, $routeParams, $location) {
		if($routeParams.userId) {
			$http.get('/article/' + $routeParams.articleId).success(function(data) {
				$scope.article = data;
			})
		} else {
			$scope.article = {
				title:'Test Title',
				content:'Test Content'
			};
		}
		$scope.save = function() {
			if($scope.article._id !== undefined) {
				$http.post('/article', _.pick($scope.article, ['title', 'content', '_id'])).success(function(data) {
					if(data.success === true) {
						$location.url('/viewarticles');
					}
				});
			} else {
				$http.post('/article', _.pick($scope.article, ['title', 'content'])).success(function(data) {
					if(data.success === true) {
						$location.url('/viewarticles');
					}
				});
			}
		};
}]);

RevaniCMAdminControllers.controller('ViewUsersController', ['$scope', '$timeout',
	'$http', '$rootScope', '$routeParams', '$location',
	function($scope, $timeout, $http, $rootScope, $routeParams, $location) {
		$scope.users = [];
		$http.get('/user').success(function(data) {
			$scope.users = data.elements;
		});
}]);