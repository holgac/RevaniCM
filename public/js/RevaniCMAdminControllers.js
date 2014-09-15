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
		$scope.remove = function(article) {
			$http.delete('/article/' + article._id).success(function(data) {
				$scope.articles = _.without($scope.articles, article);
			});
		};
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


RevaniCMAdminControllers.controller('EditUserGroupController', ['$scope', '$timeout',
	'$http', '$rootScope', '$routeParams', '$location',
	function($scope, $timeout, $http, $rootScope, $routeParams, $location) {
		if($routeParams.userGroupId) {
			$scope.usergroup = {
				permissions:0
			};
			$http.get('/usergroup/' + $routeParams.userGroupId).success(function(data) {
				$scope.usergroup = data.element;
			});
		} else {
			$scope.usergroup = {
				name:'Test User Group',
				permissions:0
			};
		}
		$scope.save = function() {
			if($scope.usergroup._id !== undefined) {
				$http.put('/usergroup/' + $scope.usergroup._id, _.pick($scope.usergroup, ['name', 'permissions'])).success(function(data) {
					if(data.success === true) {
						$location.url('/viewusergroups');
					}
				});
			} else {
				$http.post('/usergroup', _.pick($scope.usergroup, ['name', 'permissions'])).success(function(data) {
					if(data.success === true) {
						$location.url('/viewusergroups');
					}
				});
			}
		};
		$scope.permissions = [
			{
				name:'adminlogin',
				value:1
			}
		]
}]);

RevaniCMAdminControllers.controller('ViewUserGroupsController', ['$scope', '$timeout',
	'$http', '$rootScope', '$routeParams', '$location',
	function($scope, $timeout, $http, $rootScope, $routeParams, $location) {
		$scope.users = [];
		$http.get('/usergroup').success(function(data) {
			$scope.usergroups = data.elements;
		});
}]);

RevaniCMAdminControllers.controller('ViewCategoriesController', ['$scope', '$timeout',
	'$http', '$rootScope', '$routeParams', '$location',
	function($scope, $timeout, $http, $rootScope, $routeParams, $location) {
		$scope.categories = [];
		$scope.dirtyCategories = [];

		$http.get('/category?fields=_id,name,parent').success(function(data) {
			categoryMap = {};
			_.each(data.elements, function(cat) {
				cat.children = [];
				categoryMap[cat._id] = cat;
			});
			_.each(data.elements, function(cat) {
				if(cat.parent == null) {
					$scope.categories.push(cat);
				} else {
					cat.parent = categoryMap[cat.parent];
					cat.parent.children.push(cat);
				}
			});
		});

		$scope.addCategory = function() {
			if($scope.newCategoryName.length == 0) {
				return;
			}
			var data = {
				name: $scope.newCategoryName,
				parent: null,
			};
			$http.post('/category', data).success(function(data) {
				var category = _.pick(data.element, ['_id', 'name', 'parent']);
				category.children = [];
				categoryMap[category._id] = category;
				$scope.categories.push(category);
				$scope.newCategoryName = '';
			});
		};

		$scope.removeCategory = function(categoryScope) {
			$http.delete('/category/' + categoryScope.category._id).success(function(data) {
				var children = categoryScope.category.children;
				categoryScope.category.children = [];
				categoryScope.remove();
				$timeout(function() {
					$scope.categories = $scope.categories.concat(children);
				});
			});
		};
		$scope.treeOptions = {
			dropped: function(event) {
				if(event.dest.nodesScope == event.source.nodesScope) {
					return;
				}
				var url = '/category/' + event.source.nodeScope.category._id + '/setParent';
				var data = {
					parent: null
				};
				if(event.dest.nodesScope.category !== undefined) {
					data.parent = event.dest.nodesScope.category._id;
				}
				$http.put(url, data);
			},
		};

		$scope.newCategoryName = '';
}]);


RevaniCMAdminControllers.controller('EditCategoryController', ['$scope', '$timeout',
	'$http', '$rootScope', '$routeParams', '$location',
	function($scope, $timeout, $http, $rootScope, $routeParams, $location) {
		if($routeParams.categoryId) {
			$http.get('/category/' + $routeParams.categoryId + '?fields=_id,name,description').success(function(data) {
				$scope.category = data.element;
			});
		} else {
			// TODO: error or allow creating new category here?
		}
		$scope.save = function() {
			if($scope.category._id !== undefined) {
				$http.put('/category/' + $scope.category._id, _.pick($scope.category, ['name', 'description'])).success(function(data) {
					if(data.success === true) {
						$location.url('/viewcategories');
					}
				});
			} else {
				$http.post('/category', _.pick($scope.category, ['title', 'content'])).success(function(data) {
					if(data.success === true) {
						$location.url('/viewcategories');
					}
				});
			}
		};
}]);

RevaniCMAdminControllers.controller('ViewSubcontentsController', ['$scope', '$timeout',
	'$http', '$rootScope', '$routeParams', '$location',
	function($scope, $timeout, $http, $rootScope, $routeParams, $location) {
		$scope.subcontents = [];
		$http.get('/subcontent').success(function(data) {
			$scope.subcontents = data.elements;
		});
		$scope.remove = function(subcontent) {
			$http.delete('/subcontent/' + subcontent._id).success(function(data) {
				$scope.subcontents = _.without($scope.subcontents, subcontent);
			});
		};
}]);