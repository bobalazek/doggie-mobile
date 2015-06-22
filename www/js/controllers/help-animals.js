angular
	.module('application')

	.controller('HelpAnimalsController', HelpAnimalsController)
;

function HelpAnimalsController(
	$scope, $rootScope, $window, 
	UserService, DebounceService,
	AdTrackerService
) 
{
	var vm = this;

	vm.statistics = {
		visitsTotal : "0",
		visitsThisMonth : "0",
		visitsThisWeek : "0",
		visitsToday : "0",
	};

	/***** Initializers *****/
	initializeStatistics();

	/***** Function Calls *****/
	vm.showAd = showAd;

	/***** Functions *****/
	function initializeStatistics()
	{
		AdTrackerService
			.getStatistics()
			.then( function(response) {
				vm.statistics = response.statistics;
			}, function(errr) {
				console.log(error);
			})
		;
	}

	function showAd()
	{
		if( ! isDevice() )
		{
			alert('Only on mobile devices!');

			return false;
		}

		if( typeof AdMob != 'undefined' ) 
		{
			AdMob.showInterstitial();

			AdTrackerService
				.trackInterstitialAd()
				.then( function(response) {
					initializeStatistics();
				}, function(errr) {
					console.log(error);
				})
			;
		}
	}
}