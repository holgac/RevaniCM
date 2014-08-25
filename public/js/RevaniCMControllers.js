var RevaniCMControllers = angular.module('RevaniCM.controllers', []);

RevaniCMControllers.controller('ArticlesController', ['$scope', '$timeout',
	'$http', '$rootScope', '$sce',
	function($scope, $timeout, $http, $rootScope, $sce) {
		$scope.articles = [];
		$scope.fetchArticles = function() {
			$http.get('/article?fields=created,creator,title,content,_id,commentCount').success(function(data) {
				$scope.articles = data.elements;
				_.each($scope.articles, function(article) {
					article.content = $sce.trustAsHtml(article.content);
				});
			});
		};
		$scope.fetchArticles();
}]);
RevaniCMControllers.controller('ArticleController', ['$scope', '$timeout',
	'$http', '$rootScope', '$routeParams', '$sce',
	function($scope, $timeout, $http, $rootScope, $routeParams, $sce) {
		$scope.getArticle = function() {
			$scope.article = {};
			$http.get('/article/' + $routeParams.articleId + '/?fields=created,creator,title,content,comments').success(function(data) {
				$scope.article = data.element;
				$scope.article.content = $sce.trustAsHtml($scope.article.content);
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
		$scope.isCommentValid = function() {
			return ($scope.comment.author.length > 0) && ($scope.comment.content.length > 0);
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
			var url = '/article/' + $routeParams.articleId + '/addComment';
			var data = _.pick($scope.comment, ['author', 'email','title','content','notify']);
			$http.put(url, data).success(function(data) {
			});
		}
		$scope.getArticle();
		$scope.createDummyComment();
}]);