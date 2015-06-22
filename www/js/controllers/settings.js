angular
	.module('application')
	
	.controller('SettingsController', SettingsController)
;

function SettingsController(
	$scope, $rootScope, $window, 
	UserService, DebounceService
) 
{
	var vm = this;

	vm.map = false;

	/***** "Initializers" *****/
	initializeUser();
	initializeListener();

	/***** Functions *****/
	function initializeListener()
	{
		$scope.$watch( function() {
			return vm.user.locale;
		}, function(newVal, oldVal) {
			UserService.setLocale(newVal);
		});

		$scope.$on(
			'userLocationTrackingPermissionsChanged', 
			initializeUser
		);

		$scope.$on(
			'userCoordinatesChanged', 
			initializeUser
		);
	}

	function initializeUser()
	{
		vm.user = UserService.get();

		initializeMaps();
	}

	function initializeMaps() 
	{
		var latlng = new google.maps.LatLng(
			vm.user.location.coordinates.latitude,
			vm.user.location.coordinates.longitude
		);

		vm.map = new google.maps.Map(
			document.getElementById("map"),
	    	{
				center: latlng,
				zoom: 16,
				mapTypeId: google.maps.MapTypeId.ROADMAP,
				streetViewControl: false,
			}
	   	);

	   	vm.marker = new google.maps.Marker({
			position: latlng,
			map: vm.map,
		});
	}
}