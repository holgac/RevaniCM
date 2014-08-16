var RevaniCMControllers = angular.module('RevaniCM.controllers', []);

RevaniCMControllers.controller('ArticlesController', ['$scope', '$timeout',
	'$http', '$rootScope', '$sce',
	function($scope, $timeout, $http, $rootScope, $sce) {
		$scope.articles = [];
		$scope.fetchArticles = function() {
			$http.get('/article?fields=created,creator,title,content,_id').success(function(data) {
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
			$http.get('/article/' + $routeParams.articleId).success(function(data) {
				$scope.article = data.element;
				$scope.article.content = $sce.trustAsHtml($scope.article.content);
			});
		}
		$scope.getArticle();
}]);