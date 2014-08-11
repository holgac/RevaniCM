var RevaniCMControllers = angular.module('RevaniCM.controllers', []);

RevaniCMControllers.controller('ArticlesController', ['$scope', '$timeout',
	'$http', '$rootScope', '$sce',
	function($scope, $timeout, $http, $rootScope, $sce) {
		$scope.articles = [];
		$scope.fetchArticles = function() {
			$http.get('/article?fields=created,creator,title,content').success(function(data) {
				$scope.articles = data.elements;
				_.each($scope.articles, function(article) {
					article.content = $sce.trustAsHtml(article.content);
				});
			});
		};
		$scope.fetchArticles();
}]);