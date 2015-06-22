angular
	.module('application')

	.controller('PlacesController', PlacesController)
	.controller('PlacesListController', PlacesListController)
	.controller('PlacesMapController', PlacesMapController)
	.controller('PlacesDetailController', PlacesDetailController)
;

/********** Places Controller **********/
function PlacesController(
	$rootScope, $scope, $timeout,
	$filter, $ionicLoading,
	PlacesService, ConverterService,
	GeolocationService, DebounceService
)
{
	var vm = this;

	vm.placesLoaded = false;
	vm.places = [];
	vm.placeTypes = [];
	vm.searchText = '';
	vm.orderByFilter = 'distanceFromMyself';

	/***** "Initializers" *****/
	initializePlaces();
	initializePlaceTypes();
	initializeListener();

	/***** Function Calls *****/
	vm.filterByType = filterByType;
	vm.placeTypeToHumanType = placeTypeToHumanType;
	vm.broadcastPlacesFiltersChanged = broadcastPlacesFiltersChanged; // Manually broadcas on change

	/***** Functions *****/
	function placeTypeToHumanType(placeType)
	{
		return ConverterService.placeTypeToHumanType(
			placeType
		);
	}

	function filterByType(place)
	{
		if( typeof vm.placeTypes[place.type] != 'undefined'
			&& ! vm.placeTypes[place.type].checked )
			return false;

		return true;
	}

	function initializePlaces()
	{
		$ionicLoading.show({
			template: $filter('translate')('places.loadingText'),
		});

		return PlacesService
			.getAll()
			.then( function(response) {
				vm.places = response;

				vm.placesLoaded = true;

				broadcastPlacesFiltersChanged();

				$ionicLoading.hide();
			}, function(error) {
				console.log(error);

				$ionicLoading.hide();
			})
		;
	}

	function initializePlaceTypes()
	{
		return PlacesService
			.getTypes()
			.then( function(response) {
				vm.placeTypes = response;
			}, function(error) {
				console.log(error);

				$ionicLoading.hide();
			})
		;
	}

	function initializeListener()
	{
		$scope.$on('userCoordinatesChanged', DebounceService( function(event, args) {
			PlacesService.recalculateDistances();
		}, 5000, true));

		$scope.$watch( angular.bind(vm, function () {
			return vm.searchText;
		}), function (newVal, oldVal) {
			broadcastPlacesFiltersChanged();
		});

		/**
		 * When we transition for example from the lists view to maps view,
		 *   then we broadcast the current filters thought also...
		 */
		$rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
			// We should fire it a little later..once the controller is loaded...
			$timeout( function() {
				PlacesService.recalculateDistances();
				broadcastPlacesFiltersChanged();
			}, 1000);
		});
	}

	function broadcastPlacesFiltersChanged(withTimeout)
	{
		if(withTimeout)
			$timeout( function() {
				$rootScope.$broadcast('placesFiltersChanged', {
					searchText : vm.searchText,
					placeTypes : vm.placeTypes,
				});
			}, 500);
		else
			$rootScope.$broadcast('placesFiltersChanged', {
				searchText : vm.searchText,
				placeTypes : vm.placeTypes,
			});
	}
};

/********** Places List Controller **********/
function PlacesListController(
	$rootScope, $scope,
	PlacesService
)
{
	var vm = this;

	// Something may come here... I guess...
};

/********** Places Map Controller **********/
function PlacesMapController(
	$rootScope, $scope, $compile, $window, $location,
	$interval, $filter, $ionicLoading, $timeout,
	DebounceService, PlacesService,
	ConverterService, UserService
)
{
	var vm = this;

	var min = .999998;
	var max = 1.000002;

	vm.map = null;
	vm.infoWindow = new google.maps.InfoWindow();
	vm.places = [];
	vm.validPlaces = []; // Currently valid places
	vm.markers = [];
	vm.validMarkers = []; // Currently valid markers
	vm.myMarker = null; // My own marker
	vm.markerClusterer = null;
	vm.filterArgs = null; // Temporary save them, to set them on initialization
	vm.hideMenu = $location.path() == '/app/places';

	/***** Function Calls *****/
	vm.panToMyLocation = panToMyLocation;

	/***** "Initializers" *****/
	initializeMaps();
	initializeListener();

	/***** Functions *****/
	function initializePlaces()
	{
		return PlacesService
			.getAll()
			.then( function(response) {
				vm.places = response;

				initializePlacesMarkers();
			}, function(error) {
				console.log(error);

				$ionicLoading.hide();
			})
		;
	}

	function initializeListener() {
		// Map Ready
		google.maps.event.addListenerOnce(
			vm.map,
			'idle',
			initializePlaces
		);

		$rootScope.$on('userCoordinatesChanged', DebounceService( function(event, args) {
			panToMyLocation();
		}, 5000, true));

		$rootScope.$on('userCoordinatesChanged', DebounceService( function(event, args) {
			initializeMyMarker();
		}, 1000));

		$ionicLoading.show({
			template: $filter('translate')('places.loadingText'),
		});

		$rootScope.$on('placesFiltersChanged', DebounceService( function(event, args) {
			reloadMarkers(args);
		}, 1000));
	}

	function initializeMaps() {
		vm.map = new google.maps.Map(
			document.getElementById('map-places'),
			{
				center: new google.maps.LatLng(
					UserService.getCoordinates('latitude'),
					UserService.getCoordinates('longitude')
				),
				zoom: 10,
				mapTypeId: google.maps.MapTypeId.ROADMAP,
				streetViewControl: false
			}
		);

		initializeMyMarker();
	}

	/**
	 * Initialize whole collection of martkers...
	 */
	function initializePlacesMarkers()
	{

		if( vm.places !== [] &&
			vm.map !== null )
		{
			vm.markers = []; // Declare the markers as array, rather then boolean

			vm.markerClusterer = new MarkerClusterer(vm.map);

			for( var i = 0; i < vm.places.length; i++ )
			{
				var place = vm.places[i];
				var placeMarker = addPlaceMarkerToMap( place );

				// vm.markerClusterer.addMarker( placeMarker ); // All markers should be hidden per default.
			}

			if( vm.filterArgs != null )
				reloadMarkers(vm.filterArgs);

			$ionicLoading.hide();
		}
	}

	/**
	 * Just my own marker
	 */
	function initializeMyMarker()
	{
		if(vm.map === null )
			return false;

		var myLatLng = new google.maps.LatLng(
			UserService.getCoordinates('latitude'),
			UserService.getCoordinates('longitude')
		);

		var myContentString = $compile(
			'<div class="clearfix" style="padding: 10px;">' +
				$filter('translate')('general.myLocation') +
			'</div>'
		)($scope);
		myContentString = myContentString[0];

		if( vm.myMarker != null )
		{
			var lastPosition = vm.myMarker.getPosition();
			vm.myMarker.setPosition(myLatLng);

			var distanceFromLastChange = PlacesService.getDistance( {
				latitude : lastPosition.k,
				longitude : lastPosition.D,
			});

			if( distanceFromLastChange > 5 ) // Only pan, if a "large" distance difference
				vm.map.panTo(myLatLng);
		}
		else
		{
			vm.myMarker = new google.maps.Marker({
				position: myLatLng,
				map: vm.map,
				animation: google.maps.Animation.DROP,
				flat: true,
				icon: 'img/markers/expert.png',
			});
		}

		google.maps.event.addListener(
			vm.myMarker,
			'click',
			function() {
				vm.infoWindow.setContent( myContentString );
				vm.infoWindow.open(
					vm.map,
					vm.myMarker
				);
			}
		);
	}

	function addPlaceMarkerToMap(place) {
		if( ! place ||
			vm.map === null )
			return false;

		// We add the random values, beacuse so we don't have any marker on the exact same location
		//   (that causes max zoom with no markers show...)
		var placeLatLng = new google.maps.LatLng(
			place.location.coordinates.latitude * (Math.random() * (max - min) + min),
			place.location.coordinates.longitude * (Math.random() * (max - min) + min)
		);

		var placeContentString = $compile(
			'<div class="clearfix" style="padding: 0 0 10px;">' +
			'<h4 style="margin-top: 0;">' + place.name + '</h4>' +
			'<p>' + place.location.full + '</p>' +
			'<p>Tip: ' + ConverterService.placeTypeToHumanType(place.type) + '</p>' +
			'<button class="button button-small button-calm button-block" ui-sref="places.detail({ id : ' + place.id + ', hideMenu : ' + vm.hideMenu + ' })">' +
				$filter('translate')('general.details') +
			'</button>' +
			'</div>'
		)($scope);
		placeContentString = placeContentString[0];

		var placeMarker = new google.maps.Marker({
			position: placeLatLng,
			// map: vm.map,
			animation: google.maps.Animation.DROP,
			icon: 'img/markers/' + ConverterService.placeTypeToIcon( place.type ) + '.png',
			flat: true,
		});

		vm.markers[place.id] = placeMarker;

		google.maps.event.addListener(
			vm.markers[place.id],
			'click',
			( function(marker, placeId) {
				return function() {
					vm.infoWindow.setContent( placeContentString );
					vm.infoWindow.open(vm.map, marker);
				};
			})(vm.markers[place.id], place.id)
		);

		return vm.markers[place.id];
	}

	function hidePlaceMarkerOnMap(placeId)
	{
		vm.markers[placeId].setMap(null);
	}

	function showPlaceMarkerOnMap(placeId)
	{
		if( vm.map != null &&
			vm.markers[placeId] )
		{
			// vm.markers[placeId].setMap(vm.map);

			vm.validMarkers.push( vm.markers[placeId] );
		}
	}

	/**
	 * When we change the search text or place types are beeing (un)checked,
	 *  we need to trigger this funtion, to show the right markers (regarding the filters)
	 */
	function reloadMarkers(args)
	{
		vm.filterArgs = args;

		var searchText = args.searchText;
		var placeTypes = args.placeTypes;
		var havePlaceTypes = Object.keys(placeTypes).length > 0;

		vm.validPlaces = $filter('filter')(vm.places, searchText);
		var validPlacesIds = [];

		for (var i = vm.validPlaces.length - 1; i >= 0; i--) {
			var validPlace = vm.validPlaces[i];

			validPlacesIds.push(validPlace.id);
		};

		if( vm.places.length )
		{
			vm.validMarkers = []; // Reload the current valid markers...

			for (var i = vm.places.length - 1; i >= 0; i--) {
				var place = vm.places[i];

				if( validPlacesIds.indexOf(place.id) !== -1 )
				{
					if( havePlaceTypes )
					{
						if( typeof placeTypes[place.type] != 'undefined'
							&& placeTypes[place.type].checked )
							showPlaceMarkerOnMap(place.id);
						else
							hidePlaceMarkerOnMap(place.id);
					}
					else
						showPlaceMarkerOnMap(place.id);
				}
				else
					hidePlaceMarkerOnMap(place.id);
			}

			if( vm.markerClusterer )
			{
				vm.markerClusterer.clearMarkers();
				vm.markerClusterer.addMarkers(vm.validMarkers);
			}
		}
	}

	function panToMyLocation(force)
	{
		var myLatLng = new google.maps.LatLng(
			UserService.getCoordinates('latitude'),
			UserService.getCoordinates('longitude')
		);

		var currentMapLocation = {
			latitude: 0,
			longitude: 0,
		};

		if( vm.map )
		{
			var coords = vm.map.getCenter();
			var currentMapLocation = {
				latitude: coords.k,
				longitude: coords.D,
			};
		}

		var distance = PlacesService.getDistance(currentMapLocation);

		if( force )
			vm.map.panTo(myLatLng);
		else
		{
			if( distance < 20 )
				vm.map.panTo(myLatLng);
		}
	}
};

/*********** Places Detail Controller ***********/
function PlacesDetailController(
	$scope, $stateParams, $timeout,
	$state, $http, $sce, $ionicModal,
	$ionicPopup, $ionicLoading, $filter,
	DebounceService, PlacesService, UserService
)
{
	var vm = this;

	vm.map = null;
	vm.placeMarker = null;
	vm.placeLatLng = null;
	vm.placeId = $stateParams.id;
	vm.place = {};
	vm.placeLoaded = false;
	vm.hideMenu = false;

	if( $stateParams.hideMenu == 'true' )
		vm.hideMenu = true;

	/***** "Initializers" *****/
	//  initializeMaps();
	initializeListener();

	/***** Function Calls *****/
	vm.contactUs = contactUs;
	vm.modalClose = modalClose;
	vm.modalSend = modalSend;
	vm.getFacebookIframeSrc = getFacebookIframeSrc;
	vm.goBack = goBack;

	/***** Functions *****/
	function initializePlace()
	{
		PlacesService
			.getById(vm.placeId)
			.then( function(response) {
				vm.place = response;

				vm.placeLatLng = new google.maps.LatLng(
					vm.place.location.coordinates.latitude,
					vm.place.location.coordinates.longitude
				);

				vm.placeMarker = new google.maps.Marker({
					position: vm.placeLatLng,
					// map: vm.map,
					animation: google.maps.Animation.DROP,
					flat: true,
				});

				google.maps.event.trigger(vm.map, 'resize');
				vm.map.setZoom( vm.map.getZoom() );

				vm.placeMarker.setMap(vm.map);

				vm.map.setCenter( vm.placeLatLng );

				vm.placeLoaded = true;

	           	$ionicLoading.hide();
			}, function(error) {
				console.log(error);

				$state.go('places.list');
			})
		;
	}

	function initializeListener()
	{
		$ionicLoading.show({
			template: $filter('translate')('places.detail.loadingText'),
		});

		initializeMaps();

		// Map Ready
		google.maps.event.addListener(
			vm.map,
			'idle',
			initializePlace
		);
	}

	function initializeMaps()
	{
		vm.map = new google.maps.Map(
			document.getElementById("map-place"),
			{
				center: new google.maps.LatLng(
					UserService.getCoordinates('latitude'),
					UserService.getCoordinates('longitude')
				),
				zoom: 16,
				mapTypeId: google.maps.MapTypeId.ROADMAP,
				streetViewControl: false,
			}
		);
	}

	function goBack()
	{
		// To-Do: Seems not to work as it should.
		// Otherwise, it isn't really a problem,
		// since it would be only used in case
		// of multiple designs (that route
		// to the same detailed page - like
		// the new design)
		/* if( hasHistory() )
			historyGoBack();
		else */
			$state.go('places.list');
	}

	function contactUs()
	{
		vm.modalData = {
			'placeId' : vm.placeId,
		};

		$ionicModal.fromTemplateUrl('templates/PARTS/modals/contact-us.html', {
			scope: $scope,
			animation: 'slide-in-up',
			focusFirstInput: true,
		}).then(function(modal) {
			vm.modal = modal;
			vm.modalData = {};

			vm.modal.show();
		});
	}

	function modalClose()
	{
		vm.modal.hide();
	}

	function modalSend()
	{
		vm.modalValid = true;

		if( ! vm.modalData.name ||
			! vm.modalData.email ||
			! vm.modalData.message )
			vm.modalValid = false;

		if( vm.modalValid )
		{
			vm.popup = $ionicPopup.show({
				template: $filter('translate')('general.sendingText'),
				title: $filter('translate')('general.sending'),
			});

			$http({
				method : 'post',
				url : apiUrl + '/contact-us',
				headers : {
					'Content-Type': 'application/x-www-form-urlencoded'
				},
				transformRequest : function(obj) {
					var str = [];

					for(var p in obj)
						str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));

					return str.join("&");
				},
				data : {
					name : vm.modalData.name,
					email : vm.modalData.email,
					message : vm.modalData.message,
					placeId : vm.modalData.placeId,
				},
			})
				.then( function(response) {
					vm.modal.hide();
					vm.popup .close();

					vm.popup = $ionicPopup.show({
						template: $filter('translate')('contact-us.successText'),
						title: $filter('translate')('general.thanks'),
						buttons: [{
      						text: $filter('translate')('general.close'),
      						type: 'button-positive',
      						onTap: function(e) {
      							vm.popup.close();
      						}
      					}],
					});
				}, function(error) {
					console.log(error);
				});
			;
		}
		else
		{
			vm.popup = $ionicPopup.show({
				template: $filter('translate')('contact-us.errorText'),
				title: $filter('translate')('general.warning'),
				buttons: [{
					text: $filter('translate')('general.close'),
					type: 'button-positive',
					onTap: function(e) {
						vm.popup.close();
					}
				}],
			});
		}
	};

	function getFacebookIframeSrc(url)
	{
		return $sce.trustAsResourceUrl(
			'https://www.facebook.com/plugins/likebox.php?locale=' + currentLocale + '&href=' + url + '&amp;width&amp;height=290&amp;colorscheme=light&amp;show_faces=true&amp;header=true&amp;stream=false&amp;show_border=true&amp;appId=381361762010801'
		);
	};
};
