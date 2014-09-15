'use strict';


var RevaniCMDirectives = angular.module('RevaniCM.directives', []);



RevaniCMDirectives.directive('subcontent', ['$compile', function($compile) {
	return {
		restrict: 'E',
		scope: {
			position: '@'
		},
		link: function($scope, element, attrs) {
			var template = $compile('<ng-include src="\'subcontent/-1/at/' + $scope.position + '\'"></ng-include>')($scope);
			element.html(template);
		},
		controller: function($scope, $element, $timeout) {
			
		}
	}
}]);
