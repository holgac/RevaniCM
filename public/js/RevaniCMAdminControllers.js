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
			$http.get('/user/' + $routeParams.userId).success(function(data) {
				$scope.user = data.element;
				$scope.user.password = '';
				$scope.user.confirmPassword = '';
			});
		} else {
			$scope.user = {
				password:'',
				confirmPassword:'',
				email:'',
				name:'',
				username:''
			};
		}
		$scope.save = function() {
			if($scope.user._id !== undefined) {
				if(!$scope.validateForm()) {
					return;
				}
				var data = _.pick($scope.user, ['name', 'username','email']);
				if($scope.user.password.length !== 0) {
					data.password = $scope.user.password;
				}
				$http.put('/user/' + $scope.user._id, data).success(function(data) {
					if(data.success === true) {
						$location.url('/viewusers');
					}
				});
			} else {
				if(!$scope.validateForm(true)) {
					return;
				}
				$http.post('/user', _.pick($scope.user, ['name', 'username', 'email', 'password'])).success(function(data) {
					if(data.success === true) {
						$location.url('/viewusers');
					}
				});
			}
		};
		$scope.passwordError = function(strict) {
			if(!strict && $scope.user === undefined) {
				return 0;
			}
			if($scope.user.confirmPassword.length != 0 && $scope.user.confirmPassword != $scope.user.password) {
				return 1;
			}
			if(strict && $scope.user.confirmPassword != $scope.user.password) {
				return 1;
			}
			return 0;
		};
		// TODO: use form validators if possible.
		$scope.emailError = function(strict) {
			if(!strict && ($scope.user == undefined || $scope.user.email.length == 0)) {
				return 0;
			}
			var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
			if(re.test($scope.user.email)) {
				return 0;
			}
			return 1;
		}

		$scope.validateForm = function(strict) {
			if($scope.user === undefined) {
				return false;
			}
			return ($scope.user.name.length != 0) && ($scope.user.username.length != 0) && !$scope.emailError(true) && !$scope.passwordError(strict);
		}
}]);

RevaniCMAdminControllers.controller('ViewUsersController', ['$scope', '$timeout',
	'$http', '$rootScope', '$routeParams', '$location',
	function($scope, $timeout, $http, $rootScope, $routeParams, $location) {
		$scope.users = [];
		$http.get('/user').success(function(data) {
			$scope.users = data.elements;
		});
}]);