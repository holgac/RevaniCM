'use strict';


var RevaniCMAdminDirectives = angular.module('RevaniCMAdmin.directives', []);



RevaniCMAdminDirectives.directive('bitwisecheckbox', function() {
	return {
		restrict: 'E',
		scope: {
			value: '@',
			source: '='
		},
		template: '<input type="checkbox" ng-model="bitwiseValue" ng-change="valChanged()"/>',
		controller: function($scope, $element, $timeout) {
			$scope.value = parseInt($scope.value);
			// TODO: unregister this watch after initialization?
			$scope.$watch('source', function() {
				$scope.bitwiseValue = ($scope.value & $scope.source) != 0;
			});
			$scope.valChanged = function() {
				if($scope.bitwiseValue) {
					$scope.source |= $scope.value;
				} else {
					$scope.source ^= $scope.value;
				}
			};
		}
	}
});
