angular
	.module('application')
	
	.controller('ApplicationController', ApplicationController)
;

/********** Application Controller **********/
function ApplicationController(
	$rootScope, $scope, $ionicLoading, $ionicPopup,
	$location, $interval, $timeout, $state, $window,
	$ionicPlatform, StorageService, $filter, $ionicModal,
	$ionicSideMenuDelegate,
	GeolocationService, UserService
) 
{
	var vm = this;

	vm.userIsLogined = UserService.isLogined();
	vm.user = {};
	vm.userBadges = [];
	vm.isDevice = isDevice();
	vm.todaysDate = moment().format("YYYY-MM-DD");
	vm.version = version;
	vm.versionCodename = versionCodename;
	vm.timeLastUpdated = timeLastUpdated;

	/***** "Initializers" *****/
	initializeListener();

	/***** Function Calls *****/
	vm.startApplication = startApplication;
	vm.openWebsite = openWebsite;
	vm.openEmail = openEmail;
	vm.openMaps = openMaps;
	vm.call = call;
	vm.isActive = isActive;

	/***** BUG *****/
	/*
	 * Menu open class stays in body..don't know why...
	 */
	$interval( function() {
		if( ! $ionicSideMenuDelegate.isOpenLeft() &&
			angular.element(document).find('body').hasClass('menu-open') )
			angular.element(document).find('body').removeClass('menu-open')
	}, 400);

	vm.menuOpened = false;

	$rootScope.$on('$stateChangeSuccess', function() {
		vm.menuOpened = $ionicSideMenuDelegate.isOpenLeft();

		$timeout( function() {
			var menuOpenedNow = $ionicSideMenuDelegate.isOpenLeft();

			if( vm.menuOpened && vm.menuOpened != menuOpenedNow )
				$ionicSideMenuDelegate.toggleLeft();
		}, 50);
	});

    /***** Start Application *****/
    function initializeUser()
    {
		UserService
			.getMe(true)
			.then( function(response) {
				vm.user = response;
			})
		;

		UserService
			.getBadges()
			.then( function(response) {
				vm.userBadges = response;
			})
		;
    }

    function initializeListener()
    {
    	initializeUser();

    	ionic.Platform.ready( function() {
			// Must ping a little bit else the translations plugin isn't ready yet...
			$timeout( function () {
				var popup =  $ionicPopup.show({
					title : $filter('translate')('geolocation.title'),
					template : $filter('translate')('geolocation.loadingText'),
				});

				GeolocationService.geolocate( function() {
					popup.close();
				});

				// Do we geolocate, live?
				$interval( function() {
					if( ! GeolocationService.isGeolocating() )
						GeolocationService.geolocate();
				}, 10000);

	    		// Links fix!
	    		$interval( function() {
		    		jQuery('.card a').not('.item').off('click').on('click', function(e) {
		    			console.log('vall');
		    			e.preventDefault();

		    			var link = jQuery(this).attr('href');

		    			openWebsite(link);

		    			return false;
		    		});
		    	}, 500);

		    	initializePushNotifications();
		    	initializeNotifications();
			}, 50);
    	});

		$scope.$on('userStatusChanged', function(event) {
			$timeout( function() { // Some small ping, to ensure, it really gets the new data..
				initializeUser();

				vm.userIsLogined = UserService.isLogined();
			}, 50);
		});
    }

    function isActive(viewLocation, strict) 
    {
        if( strict )
        {
            if ($location.path() == viewLocation)
                return true;
            else
                return false; 
        }

        if ($location.path().search(viewLocation) >= 0) {
            if ($location.path() == viewLocation)
                return true;

            if (viewLocation == "")
                return false;
            else
                return true;
        }
        else
            return false;
    }

    function startApplication()
    {
    	$window.localStorage['alreadySeenIntro'] = true;

    	$state.go('places.list');
    }

	function openWebsite(website)
	{
		var website = encodeURI(website);

		$timeout( function () {
			window.open(website, '_system', 'location=yes');
		}, 0);

		return false;
	}

	function openMaps(coordinates, location)
	{
		var latitude = coordinates.latitude;
		var longitude = coordinates.longitude;

		var link = '';

		if( typeof ionic.Platform != 'undefined' && 
			ionic.Platform.isIOS() )
		{
			//link = encodeURI('http://maps.apple.com/?ll=' + latitude + ',' + longitude);
			//link = 'maps:daddr=' + latitude + ',' + longitude;
			link = encodeURI('http://maps.apple.com/?daddr=' + location);
		}
		else
		{
			//link = 'geo:' + latitude + ',' + longitude + '?q=' + location;
			//link = 'comgooglemaps://?daddr=' + location;
			link = 'geo:' + latitude + ',' + longitude + '?daddr=' + location;
		}

		$timeout( function () {
			window.open(
				link,
				'_system', 
				'location=yes'
			);
		}, 0);

		return false;
	}

	function openEmail(email)
	{
		var email = encodeURI(email);

		if( typeof cordova != 'undefined' &&
			cordova.plugins && 
			cordova.plugins.email )
		{
			cordova.plugins.email.open({
				to: email,
			});
		}
		else
		{
			$timeout( function () {
				window.open('mailto:' + email, '_system', 'location=yes');
			}, 0);
		}

		return false;
	}

	function call(phone)
	{
		var phone = encodeURI(phone);

		$timeout( function () {
			window.open('tel:' + phone, '_system', 'location=yes');
		}, 0);

		return false;
	}

	function initializePushNotifications()
	{
		if( isDevice() )
		{
			// To-Do!
			/*pushNotification = window.plugins.pushNotification;

			if ( device.platform == 'android' || 
				device.platform == 'Android' || 
				device.platform == "amazon-fireos" )
			{
			    pushNotification.register(
				    successHandler,
				    errorHandler,
				    {
				        "senderID": androidPushNotificationId,
				        "ecb": "onNotification"
				    }
			    );
			} else {
			    pushNotification.register(
				    tokenHandler,
				    errorHandler,
				    {
				        "badge":"true",
				        "sound":"true",
				        "alert":"true",
				        "ecb":"onNotificationAPN"
				    }
			    );
			}*/
		}
	}

	function initializeNotifications()
	{
		if( isDevice() )
		{
			/*window.plugin.notification.local.add({
			    id: '123',  // A unique id of the notification
			    date: new Date(),    // This expects a date object
			    message: 'Test message',  // The message that is displayed
			    title: 'Test title',  // The title of the message
			});*/
		}
	}
};