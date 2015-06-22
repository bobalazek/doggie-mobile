angular
	.module('application')

	.controller('AppController', AppController)
;

function AppController(
	$scope, $rootScope, $window, 
	UserService, DebounceService
) 
{
	var vm = this;
}