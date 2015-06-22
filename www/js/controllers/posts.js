angular
	.module('application')
	.controller('PostsController', PostsController)
	.controller('PostsListController', PostsListController)
	.controller('PostsDetailController', PostsDetailController)
;

/********** Posts Controller **********/
function PostsController(
	$rootScope, $scope, $filter,
	$ionicLoading, $timeout,
	PostsService
)
{
	var vm = this;

	vm.postsLoaded = false;
	vm.posts = [];
	vm.searchText = '';
	vm.orderByFilter = 'timeCreated.date';
	vm.orderByFilterReverse = false;

	/***** "Initializers" *****/
	initializeListener();
	initializePosts();

	/***** Function calls *****/
	vm.itemHeight = itemHeight;
	vm.initializePosts = initializePosts;

	/***** Functions ******/
	function initializeListener()
	{
		$scope.$watch( angular.bind(vm, function () {
			return vm.orderByFilter;
		}), function (newVal, oldVal) {
			if( newVal == 'timeCreated.date' )
				vm.orderByFilterReverse = true;
			else
				vm.orderByFilterReverse = false;
		});
	}

	function initializePosts()
	{
		$ionicLoading.show({
			template: $filter('translate')('posts.loadingText'),
		});

		$timeout( function() {
			return PostsService
				.getAll()
				.then( function(response) {
					vm.posts = response;

					vm.postsLoaded = true;

					$scope.$broadcast('scroll.refreshComplete');

					$ionicLoading.hide();
				}, function(error) {
					console.log(error);

					$ionicLoading.hide();
				})
			;
		}, 10);
	}

	function itemHeight(index)
	{
		return index == 0 ? 392 : 108;
	}
}

/********** Posts List Controller **********/
function PostsListController(
	$rootScope, $scope,
	PostsService
)
{
	var vm = this;
};

/********** Posts Detail Controller **********/
function PostsDetailController(
	$rootScope, $scope, $ionicLoading, $filter,
	$stateParams, $state, $ionicNavBarDelegate,
	PostsService
)
{
	var vm = this;

	vm.postLoaded = false;
	vm.post = {};

	vm.goBack = goBack;

	$ionicLoading.show({
		template: $filter('translate')('posts.loadingText'),
	});

	PostsService
		.getById($stateParams.id)
		.then( function(response) {
			vm.post = response;

			vm.postLoaded = true;

           	$ionicLoading.hide();
		}, function(error) {
			console.log(error);

			$state.go('posts.list');
		});

	/***** Functions *****/
	function goBack()
	{
		$state.go('posts.list');
	}
};
