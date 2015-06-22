angular
	.module('application')

	.factory('DebounceService', function($timeout, $q) {
		return function debounce(func, wait, immediate) {
			var timeout;
			var deferred = $q.defer();

			return function() {
				var context = this, args = arguments;
				var later = function() {
					timeout = null;

					if(!immediate) {
						deferred.resolve(func.apply(context, args));
						deferred = $q.defer();
					}
				};

				var callNow = immediate && !timeout;

				if ( timeout ) {
					$timeout.cancel(timeout);
				}

				timeout = $timeout(later, wait);

				if (callNow) {
					deferred.resolve(func.apply(context,args));
					deferred = $q.defer();
				}

				return deferred.promise;
			};
		};
	})

	.factory('GeolocationService', function($rootScope, $interval, $timeout, UserService) {
		var GeolocationService = {};
		var geolocating = false;

		/* TO-DO: Refetch the data after refresh
		$rootScope.$on('settingsChanged', function(event) {
			trackMyLocation = SettingsService.get('trackMyLocation');
			trackMyLocationSeconds = SettingsService.get('trackMyLocationSeconds');
		});*/

		/* TO-DO: Dynamic tracking
		$timeout( function() {
			GeolocationService.geolocate();

			if( trackMyLocation && 
				trackMyLocationSeconds > 5 )
			{
				$timeout( function() {
					GeolocationService.geolocate();
				}, trackMyLocationSeconds * 1000);
			}
		}, trackMyLocationSeconds * 1000);*/

		GeolocationService.isGeolocating = function() {
			return geolocating;
		}

		GeolocationService.geolocate = function( callback ) {
			geolocationg = true;
			var timeout = 5000;

			navigator.geolocation.getCurrentPosition( function(pos) {
				UserService.setLocationTrackingPermissions(true);
				UserService.setCoordinates(pos.coords);

				if( callback ) callback();

				geolocating = false;
			}, function(error) {
				UserService.setLocationTrackingPermissions(false);

				if( callback ) callback();

				geolocating = false;
			}, {
				enableHighAccuracy: false,
				timeout: timeout,
				maximumAge: timeout,
			});

			$timeout( function() {
				if( callback ) 
					callback();
			}, timeout);
		};

		return GeolocationService;
	})

	.factory('AdTrackerService', function($q, $http, UserService) {
		var AdTrackerService = {};

		AdTrackerService.getStatistics = function() {
			var deferred = $q.defer();

			$http
				.get(apiUrl + '/ad-tracker/statistics')
				.then( function(response) {
					deferred.resolve( response.data );
				}, function(error) {
					deferred.reject( error );
				});

			return deferred.promise;
		};


		AdTrackerService.trackInterstitialAd = function() {
			var deferred = $q.defer();

			var data = {};

			var user = UserService.getMe();

			data['userId'] = user.id;

			$http({
				method : 'post',
				url : apiUrl + '/ad-tracker',
				headers : {
					'Content-Type': 'application/x-www-form-urlencoded'
				},
				transformRequest : function(obj) {
					var str = [];

					for(var p in obj)
						str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
					
					return str.join("&");
				},
				data : data,
			})
				.then( function(response) {
					deferred.resolve( response.data );
				}, function(error) {
					deferred.reject( error );
				})
			;

			return deferred.promise;
		};

		return AdTrackerService;
	})

	.factory('StorageService', function($window) {
		var StorageService = {};

		StorageService.set = function(key, value) {
			$window.localStorage[key] = value;
		};

		StorageService.get = function(key, defaultValue) {
			return $window.localStorage[key] || defaultValue;
		};

		StorageService.setObject = function(key, value) {
			$window.localStorage[key] = JSON.stringify(value);
		};

		StorageService.getObject = function(key, defaultObject) {
			var defaultObject = defaultObject || {};
			return JSON.parse($window.localStorage[key] || '{}') || defaultObject;
		};

		return StorageService;
	})
;