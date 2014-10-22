var RevaniCMAdminControllers = angular.module('RevaniCMAdmin.controllers', ['textAngular']);

RevaniCMAdminControllers.controller('EditArticleController', ['$scope', '$timeout',
	'$http', '$rootScope', '$routeParams', '$location', '$modal',
	function($scope, $timeout, $http, $rootScope, $routeParams, $location, $modal) {
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
				$http.put('/article/' + $scope.article._id, _.pick($scope.article, ['title', 'content', 'category'])).success(function(data) {
					if(data.success === true) {
						$location.url('/viewarticles');
					}
				});
			} else {
				$http.post('/article', _.pick($scope.article, ['title', 'content', 'category'])).success(function(data) {
					if(data.success === true) {
						$location.url('/viewarticles');
					}
				});
			}
		};
		$scope.selectCategory = function() {
			$modal.open({
				templateUrl: '/adminselectcategory',
				controller: 'CategorySelectorController',
				size: 'lg',
			}).result.then(function(category) {
				if(category) {
					$scope.article.category = category;
				}
			});
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
		];
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


RevaniCMAdminControllers.controller('EditSubcontentController', ['$scope', '$timeout',
	'$http', '$rootScope', '$routeParams', '$location', '$modal',
	function($scope, $timeout, $http, $rootScope, $routeParams, $location, $modal) {
		if($routeParams.subcontentId) {
			$http.get('/subcontent/' + $routeParams.subcontentId).success(function(data) {
				$scope.subcontent = data.element;
				var positions = _.reduce($scope.subcontent.positions, function(memo, pos) {
					return memo + pos + ', ';
				}, '');
				$scope.subcontent.positions = positions;
			});
		} else {
			$scope.subcontent = {
				name: '',
				data: {},
				type: 1
			};
		}
		$scope.save = function() {
			var positions = _.compact($scope.subcontent.positions.replace(/ /g, '').split(','));
			var subcontentData = _.pick($scope.subcontent, ['name', 'type']);
			subcontentData.positions = positions;
			var dataFields = {
				1: ['text'],
				2: ['image'],
				3: ['menu', 'template']
			};
			subcontentData.data = _.pick($scope.subcontent.data, dataFields[subcontentData.type]);

			if($scope.subcontent._id !== undefined) {
				$http.put('/subcontent/' + $scope.subcontent._id, subcontentData).success(function(data) {
					if(data.success === true) {
						$location.url('/viewsubcontents');
					}
				});
			} else {
				$http.post('/subcontent', subcontentData).success(function(data) {
					if(data.success === true) {
						$location.url('/viewsubcontents');
					}
				});
			}
		};

		$scope.selectMenu = function() {
			$modal.open({
				templateUrl: '/adminselectmenu',
				controller: 'MenuSelectorController',
				size: 'lg',
			}).result.then(function(menu) {
				if(menu) {
					if(!$scope.subcontent.data) {
						$scope.subcontent.data = {};
					}
					$scope.subcontent.data.menu = menu;
				}
			});
		}
}]);

RevaniCMAdminControllers.controller('ViewMenusController', ['$scope', '$timeout',
	'$http', '$rootScope', '$routeParams', '$location',
	function($scope, $timeout, $http, $rootScope, $routeParams, $location) {
		$scope.menus = [];
		$http.get('/menu').success(function(data) {
			$scope.menus = data.elements;
		});
		$scope.remove = function(menu) {
			$http.delete('/menu/' + menu._id).success(function(data) {
				$scope.menus = _.without($scope.menus, menu);
			});
		};
}]);


RevaniCMAdminControllers.controller('EditMenuController', ['$scope', '$timeout',
	'$http', '$rootScope', '$routeParams', '$location', '$modal',
	function($scope, $timeout, $http, $rootScope, $routeParams, $location, $modal) {
		if($routeParams.menuId) {
			$http.get('/menu/' + $routeParams.menuId).success(function(data) {
				$scope.menu = data.element;
				_.each($scope.menu.subMenus, function(subMenu) {
					// subMenu.type = '' + subMenu.type;
					console.log(subMenu.type);
					console.log(typeof(subMenu.type));
				})
			});
		} else {
			$scope.menu = {
				name: '',
				subMenus: [],
			};
		}
		$scope.save = function() {
			var menuData = _.pick($scope.menu, 'name','subMenus');
			if($scope.menu._id !== undefined) {
				$http.put('/menu/' + $scope.menu._id, menuData).success(function(data) {
					if(data.success === true) {
						$location.url('/viewmenus');
					}
				});
			} else {
				$http.post('/menu', menuData).success(function(data) {
					if(data.success === true) {
						$location.url('/viewmenus');
					}
				});
			}
		};
		$scope.addSubMenu = function() {
			$scope.menu.subMenus.push({
				name: 'Unnamed',
				type: 1,
				data: {
					article: null
				}
			});
		};
		$scope.removeSubMenu = function(subMenu) {
			$scope.menu.subMenus = _.without($scope.menu.subMenus, subMenu);
		};

		$scope.selectArticle = function(subMenu) {
			$modal.open({
				templateUrl: '/adminselectarticle',
				controller: 'ArticleSelectorController',
				size: 'lg',
			}).result.then(function(article) {
				if(article) {
					subMenu.data.article = article;
				}
			});
		};
		$scope.selectCategory = function(subMenu) {
			$modal.open({
				templateUrl: '/adminselectcategory',
				controller: 'CategorySelectorController',
				size: 'lg',
			}).result.then(function(category) {
				if(category) {
					subMenu.data.category = category;
				}
			});
		};
}]);

RevaniCMAdminControllers.controller('ArticleSelectorController', ['$scope', '$timeout',
	'$http', '$rootScope', '$routeParams', '$location', '$modalInstance',
	function($scope, $timeout, $http, $rootScope, $routeParams, $location, $modalInstance) {
		$scope.articles = [];
		$http.get('/article').success(function(data) {
			$scope.articles = data.elements;
		});
		$scope.close = function() {
			$modalInstance.dismiss('cancel');
		}
		$scope.selectArticle = function(article) {
			$modalInstance.close(article._id);
		}
}]);

RevaniCMAdminControllers.controller('CategorySelectorController', ['$scope', '$timeout',
	'$http', '$rootScope', '$routeParams', '$location', '$modalInstance',
	function($scope, $timeout, $http, $rootScope, $routeParams, $location, $modalInstance) {
		$scope.categories = [];
		$http.get('/category').success(function(data) {
			$scope.categories = data.elements;
		});
		$scope.close = function() {
			$modalInstance.dismiss('cancel');
		}
		$scope.selectCategory = function(category) {
			$modalInstance.close(category._id);
		}
}]);

RevaniCMAdminControllers.controller('MenuSelectorController', ['$scope', '$timeout',
	'$http', '$rootScope', '$routeParams', '$location', '$modalInstance',
	function($scope, $timeout, $http, $rootScope, $routeParams, $location, $modalInstance) {
		$scope.menus = [];
		$http.get('/menu').success(function(data) {
			$scope.menus = data.elements;
		});
		$scope.close = function() {
			$modalInstance.dismiss('cancel');
		}
		$scope.selectMenu = function(menu) {
			$modalInstance.close(menu._id);
		}
}]);
