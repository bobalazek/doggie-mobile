angular
	.module('application')

	.controller('AnimalsController', AnimalsController)
	.controller('AnimalsListController', AnimalsListController)
	.controller('AnimalsDetailController', AnimalsDetailController)
;

/********** Animals Controller **********/
function AnimalsController(
	$rootScope, $scope, $stateParams, $timeout, $filter,
	$ionicLoading, AnimalsService, ConverterService,
	DebounceService
)
{
	var vm = this;

	vm.animalsLoaded = false;
	vm.animals = [];
	vm.animalSpecies = [];
	vm.searchText = '';
	vm.orderByFilter = 'timeCreated.date';
	vm.orderByFilterReverse = false;
	vm.which = 'all';

	/***** "Initializers" *****/
	// initializeAnimals();
	initializeAnimalSpecies();
	initializeListener();

	/***** Function Calls *****/
	vm.animalAgeToHumanAge = animalAgeToHumanAge;
	vm.broadcastAnimalsFiltersChanged = broadcastAnimalsFiltersChanged;
	vm.filterBySpecies = filterBySpecies;
	vm.initializeAnimals = initializeAnimals;
	vm.lastAnimalsInitialization = new Date();

	/***** Functions ******/
	function initializeListener()
	{
		$rootScope.$on(
			'animalsWhichChanged',
			function(event, args) {
				var which = args.which;

				initializeAnimals(which);
			}
		);

		$rootScope.$watch( angular.bind(vm, function () {
			return vm.orderByFilter;
		}), function (newVal, oldVal) {
			if( newVal == 'timeCreated.date' )
				vm.orderByFilterReverse = true;
			else
				vm.orderByFilterReverse = false;
		});
	}

	function initializeAnimals(which)
	{
		if( typeof which == 'undefined' )
			return false;

		vm.which = which;

		vm.animals = [];

		$ionicLoading.show({
			template: $filter('translate')('animals.loadingText'),
		});

		return AnimalsService
			.getAll(which)
			.then( function(response) {
				vm.animals = response;

				vm.animalsLoaded = true;

				$ionicLoading.hide();
			}, function(error) {
				console.log(error);

				$ionicLoading.hide();
			})
		;
	}

	function filterBySpecies(animal)
	{
		if( typeof vm.animalSpecies[animal.species] != 'undefined'
			&& ! vm.animalSpecies[animal.species].checked )
			return false;

		return true;
	}

	function initializeAnimalSpecies()
	{
		return 	AnimalsService
			.getSpecies()
			.then( function(response) {
				vm.animalSpecies = response;
			}, function(error) {
				console.log(error);
			})
		;
	}
	function animalAgeToHumanAge(age)
	{
		return ConverterService.animalAgeToHumanAge(age);
	}

	function broadcastAnimalsFiltersChanged()
	{
		$rootScope.$broadcast('animalsFiltersChanged', {
			searchText : vm.searchText,
			animalSpecies : vm.animalSpecies,
		});
	}
};

/********** Animals List Controller **********/
function AnimalsListController(
	$rootScope, $scope, $stateParams,
	$location,
	AnimalsService, DebounceService
)
{
	var vm = this;

	vm.which = $stateParams.which;

	// initializeListener();
	broadcastAnimalWhichChanged();

	/***** Function calls *****/
	vm.broadcastAnimalWhichChanged = broadcastAnimalWhichChanged;

	/***** Functions *****/
	function initializeListener()
	{
		$rootScope.$on(
			'$ionicView.beforeEnter',
			DebounceService( function() {
				broadcastAnimalWhichChanged();
			}, 2000, true)
		);
	}

	function broadcastAnimalWhichChanged()
	{
		$rootScope.$broadcast('animalsWhichChanged', {
			which : vm.which,
		});
	}
};

/********** Animals Detail Controller **********/
function AnimalsDetailController(
	$rootScope, $scope, $ionicLoading,
	$stateParams, $state, $filter,
	$ionicNavBarDelegate, AnimalsService
)
{
	var vm = this;

	vm.animal = {};
	vm.animalLoaded = false;
	vm.hideMenu = false;

	if( $stateParams.hideMenu == 'true' )
		vm.hideMenu = true;

	/***** Initializers *****/
	initializeListener();

	/***** Function Calls *****/
	vm.goBack = goBack;

	/***** Functions *****/
	function initializeListener()
	{
		$ionicLoading.show({
			template: $filter('translate')('animals.detail.loadingText'),
		});

		AnimalsService
			.getById($stateParams.id)
			.then( function(response) {
				vm.animal = response;

				vm.animalLoaded = true;

	           	$ionicLoading.hide();
			}, function(error) {
				console.log(error);
				
				$state.go('animals.list');
			})
		;
	}

	function goBack()
	{
		if( window.history )
			window.history.back();
		else
			$state.go('animals.list', { which : 'all' });
	}
};
