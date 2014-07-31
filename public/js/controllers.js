var RevCMSControllers = angular.module('RevCMS.controllers', []);

RevCMSControllers.controller('ArticlesController', ['$scope', '$timeout', '$http', '$rootScope',
	function($scope, $timeout, $http, $rootScope) {
		$scope.articles = [];
		$scope.fetchArticles = function() {
			_.each(_.range(12), function(counter) {
				$scope.articles.push({
					title:'test title ' + counter,
					contentShort: 'Something happened...' + counter,
					created: new Date()
				});
			});
		};
		$scope.fetchArticles();
}]);