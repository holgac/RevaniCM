var RevaniCMControllers = angular.module('RevaniCM.controllers', []);

RevaniCMControllers.controller('LoadingController', ['$scope', '$timeout',
	'$http', '$rootScope', '$sce',
	function($scope, $timeout, $http, $rootScope, $sce) {
		$scope.loaderCount = 0;
		$scope.$on('LoadingStarted', function(event) {
			$scope.loaderCount++;
		});
		$scope.$on('LoadingFinished', function(event) {
			$scope.loaderCount--;
		});
}]);


RevaniCMControllers.controller('ArticlesController', ['$scope', '$timeout',
	'$http', '$rootScope', '$sce',
	function($scope, $timeout, $http, $rootScope, $sce) {
		$scope.articles = [];
		$scope.fetchArticles = function() {
			$rootScope.$broadcast('LoadingStarted');
			$http.get('/article?fields=created,creator,title,content,_id,commentCount&sort=-created').success(function(data) {
				$scope.articles = data.elements;
				_.each($scope.articles, function(article) {
					article.content = $sce.trustAsHtml(article.content);
				});
				$rootScope.$broadcast('LoadingFinished');
			});
		};
		$scope.fetchArticles();
}]);
RevaniCMControllers.controller('ArticleController', ['$scope', '$timeout',
	'$http', '$rootScope', '$routeParams', '$sce',
	function($scope, $timeout, $http, $rootScope, $routeParams, $sce) {
		$scope.getArticle = function() {
			$scope.article = {};
			$rootScope.$broadcast('LoadingStarted');
			$http.get('/article/' + $routeParams.articleId + '/?fields=created,creator,title,content,comments').success(function(data) {
				$scope.article = data.element;
				$scope.article.content = $sce.trustAsHtml($scope.article.content);
				$rootScope.$broadcast('LoadingFinished');
			});
		};
		$scope.createDummyComment = function() {
			$scope.comment = {
				author:'',
				email:'',
				title:'',
				content:'',
				notify: false
			};
		};
		$scope.isCommentValid = function(isLoggedIn) {
			return (($scope.comment.author.length > 0) || isLoggedIn) && ($scope.comment.content.length > 0);
		};
		$scope.isCommentEmailValid = function() {
			// TODO: emails with single quote is validated with this regex
			var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
			if(re.test($scope.comment.email)) {
				return true;
			}
			return false;
		};

		$scope.publishComment = function() {
			$rootScope.$broadcast('LoadingStarted');
			var url = '/article/' + $routeParams.articleId + '/addComment';
			var data = _.pick($scope.comment, ['author', 'email','title','content','notify']);
			$http.put(url, data).success(function(data) {
				$scope.article.comments.push(data.comment);
				$scope.createDummyComment();
				$rootScope.$broadcast('LoadingFinished');
			});
		}
		$scope.getArticle();
		$scope.createDummyComment();
}]);