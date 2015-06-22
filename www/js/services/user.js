angular
	.module('application')

	.factory('UserService', function(
		$rootScope, $http, $ionicPopup, 
		$q, $translate, StorageService
	) {
		var UserService = {};
		var data = {
			locale : StorageService.get('user.locale', defaultLocale),
			isLogined : false,
			token : StorageService.get('user.token', null),
			me : {}, 
			// me: JSON.parse( StorageService.get('user.me', {}) ), // All my data, that I can get from the server
			pets : [],
			badges : [],
			location: {
				hasTrackingPermissions : false, // By default, we should have the permissions
				isTracking : JSON.parse( StorageService.get( 'user.locationIsTracking', false ) ), // Do we track the users location
				isTrackingEveryXSeconds : parseInt( StorageService.get( 'user.locationIsTrackingEveryXSeconds', 10 ) ), // If the upper is tru, on how many seconds to we track?
				isSetManually : JSON.parse( StorageService.get( 'user.locationIsSetManually', false ) ), // Have we gotten the location manually?
				isSetManuallyAddress : StorageService.get( 'user.locationIsSetManuallyAddress', '' ),
				/*coordinates : StorageService.getObject('user.locationCoordinates', { // Default is somewhere in the middle of Ljubljana
					latitude : 46.0569465,
					longitude : 14.5057515,
				}),*/
				coordinates : { // Default is somewhere in the middle of Ljubljana
					latitude : 46.0569465,
					longitude : 14.5057515,
				},
			},
		};

		if( data.token != 'null' && 
			data.token != null && 
			data.token != '' )
			data.isLogined = true;

		UserService.get = function() {
			return data;
		};

		/***** Auth & Register & Other *****/
		UserService.login = function(data) {
			var deferred = $q.defer();

			data.pets = [];

			$http({
				method : 'post',
				url : apiUrl + '/members-area/login',
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
					if( typeof response.data.error == 'undefined' )
						UserService.setToken(response.data.token);
					
					deferred.resolve( response.data );
				}, function(error) {
					deferred.reject( error );
				})
			;

			return deferred.promise;
		};

		UserService.resetPassword = function(data) {
			var deferred = $q.defer();

			$http({
				method : 'post',
				url : apiUrl + '/members-area/reset-password',
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

		UserService.logout = function() {
			UserService.setToken(null);
			data.isLogined = false;
			data.pets = [];
		};

		UserService.register = function(data) {
			var deferred = $q.defer();

			$http({
				method : 'post',
				url : apiUrl + '/members-area/register',
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
					if( typeof response.data.error == 'undefined' )
					{
						UserService.setToken(response.data.token);
					}

					deferred.resolve( response.data );
				}, function(error) {
					deferred.reject( error );
				})
			;

			return deferred.promise;
		};

		UserService.isLogined = function() {
			return data.isLogined;
		};

		UserService.getMe = function(fromServer) {
			if( fromServer )
			{
				var deferred = $q.defer();

				$http
					.get(apiUrl + '/members-area/me/?token=' + UserService.getToken())
					.then( function(response) {
						if( ! response.data.image )
							response.data.image = 'img/placeholders/user.png';
						
						deferred.resolve( response.data );
					}, function(error) {
						deferred.reject( error );
					})
				;

				return deferred.promise;
			}

			return data.me;
		};

		UserService.setLocale = function(locale) {
			StorageService.set('user.locale', locale);
			data.locale = StorageService.get( 'user.locale' );

			// To-Do: Check if exists...
			$translate.use( data.locale );

			$rootScope.$broadcast('userLocaleChanged');
		};

		UserService.getLocale = function() {
			return data.locale;
		}

		UserService.setMe = function(me) {
			// StorageService.setObject('user.me', me);
			// data.me = StorageService.getObject( 'user.me' );
			data.me = me;

			$rootScope.$broadcast('userStatusChanged');
		};

		UserService.saveMe = function(data) {
			var deferred = $q.defer();

			$http({
				method : 'post',
				url : apiUrl + '/members-area/me/?token=' + UserService.getToken(),
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
					$rootScope.$broadcast('userProfileSettingsChanged');

					UserService
						.getMe(true)
						.then( function(response) {
							UserService.setMe(response);
						})
					;

					deferred.resolve( response.data );
				}, function(error) {
					deferred.reject( error );
				})
			;

			return deferred.promise;
		};

		UserService.getToken = function() {
			return data.token;
		};

		UserService.setToken = function(token) {
			StorageService.set('user.token', token);
			data.token = StorageService.get( 'user.token' );
			data.isLogined = token == null ? false : true;

			$rootScope.$broadcast('userStatusChanged');
		};

		UserService.getToken = function() {
			return data.token;
		};

		/***** Location *****/
		UserService.setLocationTrackingPermissions = function(value) {
			data.location.hasTrackingPermissions = value;

			$rootScope.$broadcast('userLocationTrackingPermissionsChanged');
		};

		UserService.getLocationTrackingPermissions = function() {
			return data.location.hasTrackingPermissions;
		};

		UserService.setLocationTracking = function(value) {
			StorageService.set('user.locationIsTracking', value);

			data.location.isTracking = StorageService.get( 'user.locationIsTracking' );
		};

		UserService.getLocationTracking = function(value) {
			return data.location.isTracking;
		};

		UserService.setLocationTrackingEveryXSeconds = function(value) {
			StorageService.set('user.locationIsTrackingEveryXSeconds', value);

			data.location.isTracking = StorageService.get( 'user.locationIsTrackingEveryXSeconds' );
		};

		UserService.getLocationTrackingEveryXSeconds = function(value) {
			return data.location.isTrackingEveryXSeconds;
		};

		UserService.setLocationCoordinates = function(coordinates) {
			/*StorageService.setObject('user.locationCoordinates', coordinates);
			data.location.coordinates = StorageService.getObject('user.locationCoordinates');*/
			data.location.coordinates = coordinates;

			$rootScope.$broadcast('userCoordinatesChanged');
			$rootScope.$broadcast('coordinatesChanged'); // Will be depreciated soon
		};

		UserService.getLocationCoordinates = function(what) {
			// Fallback, if the coordinates are somehow been saved empty...
			if( ! data.location.coordinates.latitude ||
				! data.location.coordinates.longitude )
				data.location.coordinates = { // Default is somewhere in the middle of Ljubljana
					latitude : 46.0569465,
					longitude : 14.5057515,
				};

			if( what )
				return data.location.coordinates[what];

			return data.location.coordinates;
		};


		/***** My Badges *****/
		// List
		UserService.getBadges = function() {
			var deferred = $q.defer();

			if( ! data.badges || 
				data.badges.length == 0 )
			{
				$http
					.get(apiUrl + '/members-area/me/badges/?token=' + UserService.getToken())
					.then( function(response) {
						data.badges = response.data.results;

						deferred.resolve( data.badges );
					}, function(error) {
						deferred.reject( error );
					})
				;
			}
			else
				deferred.resolve( data.badges );

			return deferred.promise;
		};

		/***** My Pets *****/
		// List
		UserService.getPets = function(forceNewData) {
			var deferred = $q.defer();

			if( data.pets.length == 0 || forceNewData )
			{
				$http
					.get(apiUrl + '/members-area/me/pets/?token=' + UserService.getToken())
					.then( function(response) {
						data.pets = response.data.results;

						deferred.resolve( data.pets );
					}, function(error) {
						deferred.reject( error );
					})
				;
			}
			else
				deferred.resolve( data.pets );

			return deferred.promise;
		};

		// Remove
		UserService.removePet = function(id) {
			var deferred = $q.defer();

			$http
				.delete(apiUrl + '/members-area/me/pets/' + id + '?token=' + UserService.getToken())
				.then( function(response) {
					deferred.resolve( response.data );
				}, function(error) {
					deferred.reject( error );
				})
			;

			return deferred.promise;
		};

		// Detail
		UserService.getPet = function(id) {
			var deferred = $q.defer();

			$http
				.get(apiUrl + '/members-area/me/pets/' + id + '?token=' + UserService.getToken())
				.then( function(response) {
					deferred.resolve( response.data.result );
				}, function(error) {
					deferred.reject( error );
				})
			;

			return deferred.promise;
		};

		// New
		UserService.newPet = function(data) {
			var deferred = $q.defer();

			$http({
				method : 'post',
				url : apiUrl + '/members-area/me/pets/?token=' + UserService.getToken(),
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

		// Edit
		UserService.editPet = function(id, data) {
			var deferred = $q.defer();

			$http({
				method : 'post',
				url : apiUrl + '/members-area/me/pets/' + id + '?token=' + UserService.getToken(),
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

		/***** Check *****/
		if( UserService.isLogined() )
		{			
			UserService
				.getMe(true)
				.then( function(response) {
					UserService.setMe(response);
				}, function(error) {
					console.log(error);
				})
			;
		}

		/***** Aliases *****/
		UserService.getCoordinates = UserService.getLocationCoordinates;
		UserService.setCoordinates = UserService.setLocationCoordinates;

		return UserService;
	})
;