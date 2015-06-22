angular
	.module('application')

	.controller('EventsController', EventsController)
	.controller('EventsListController', EventsListController)
	.controller('EventsMapController', EventsMapController)
	.controller('EventsDetailController', EventsDetailController)
;

/********** Events Controller **********/
function EventsController(
	$rootScope, $scope, $timeout,
	$filter, $ionicLoading,
	EventsService, ConverterService
)
{
	var vm = this;

	vm.eventsLoaded = false;
	vm.events = [];
	vm.eventTypes = [];
	vm.searchText = '';
	vm.orderByFilter = 'timeStart.date';

	/***** Function calls *****/
	vm.broadcastEventsFiltersChanged = broadcastEventsFiltersChanged;
	vm.eventTypeToHumanType = eventTypeToHumanType;
	vm.filterByType = filterByType;

	/***** "Initializers" *****/
	initializeEvents();
	initializeEventTypes();
	initializeListener();

	/***** Functions ******/
	function initializeListener()
	{
		$scope.$watch( angular.bind(vm, function () {
			return vm.searchText;
		}), function (newVal, oldVal) {
			broadcastEventsFiltersChanged();
		});

		/**
		 * When we transition for example from the lists view to maps view,
		 *   then we broadcast the current filters thought also...
		 */
		$rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
			// We should fire it a little later..once the controller is loaded...
			$timeout( function() {
				broadcastEventsFiltersChanged();
			}, 1000);
		});
	}

	function initializeEvents()
	{
		$ionicLoading.show({
			template: $filter('translate')('events.loadingText'),
		});

		return EventsService
			.getAll()
			.then( function(response) {
				vm.events = response;

				vm.eventsLoaded = true;

				$ionicLoading.hide();
			}, function(error) {
				console.log(error);

				$ionicLoading.hide();
			})
		;
	}


	function initializeEventTypes()
	{
		return EventsService
			.getTypes()
			.then( function(response) {
				vm.eventTypes = response;
			}, function(error) {
				console.log(error);
			})
		;
	}

	function filterByType(event)
	{
		if( typeof vm.eventTypes[event.type] != 'undefined'
			&& ! vm.eventTypes[event.type].checked )
			return false;

		return true;
	}

	function broadcastEventsFiltersChanged()
	{
		$rootScope.$broadcast('eventsFiltersChanged', {
			searchText : vm.searchText,
			eventTypes : vm.eventTypes,
		});
	}

	function eventTypeToHumanType(type)
	{
		return ConverterService.eventTypeToHumanType(type);
	}
}

/********** Events List Controller **********/
function EventsListController(
	$rootScope, $scope,
	EventsService
)
{
	var vm = this;
};

/********** Events Map Controller **********/
function EventsMapController(
	$rootScope, $scope, $compile, $location,
	$interval, $filter, $ionicLoading,
	DebounceService, PlacesService,
	ConverterService, UserService,
	EventsService
)
{
	var vm = this;

	var min = .999998;
	var max = 1.000002;

	vm.map = null;
	vm.infoWindow = new google.maps.InfoWindow();
	vm.events = [];
	vm.validEvents = []; // Currently valid events
	vm.markers = [];
	vm.validMarkers = []; // Currently valid markers
	vm.myMarker = null; // My own marker
	vm.markerClusterer = null;
	vm.filterArgs = false; // Temporary save them, to set them on initialization
	vm.hideMenu = $location.path() == '/app/places';

	/***** Function Calls *****/
	vm.panToMyLocation = panToMyLocation;

	/***** "Initializers" *****/
	initializeMaps();
	initializeListener();

	/***** Functions *****/
	function initializeEvents()
	{
		return EventsService
			.getAll()
			.then( function(response) {
				vm.events = response;
				initializeEventsMarkers();
			}, function(error) {
				console.log(error);
			})
		;
	}

	function initializeListener() {
		// Map Ready
		google.maps.event.addListenerOnce(
			vm.map,
			'idle',
			initializeEvents
		);

		$rootScope.$on('userCoordinatesChanged', DebounceService( function(event, args) {
			panToMyLocation();
		}, 5000, true));

		$ionicLoading.show({
			template: $filter('translate')('events.loadingText'),
		});

		$rootScope.$on('eventsFiltersChanged', DebounceService( function(event, args) {
			reloadMarkers(args);
		}, 1000));

		$rootScope.$on('coordinatesChanged', DebounceService( function(event, args) {
			initializeMyMarker();
		}, 1000));
	}

	function initializeMaps() {
		vm.map = new google.maps.Map(
			document.getElementById('map-events'),
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
	 * Initialize whole collection of markers...
	 */
	function initializeEventsMarkers()
	{
		if( vm.events !== [] &&
			vm.map !== null )
		{
			vm.markers = []; // Declare the markers as array, rather then boolean

			vm.markerClusterer = new MarkerClusterer(vm.map);

			for( var i = 0; i < vm.events.length; i++ )
			{
				var event = vm.events[i];
				var eventMarker = addEventMarkerToMap( event );

				// vm.markerClusterer.addMarker( eventMarker ); // All markers should be hidden per default.
			}

			if( vm.filterArgs != false )
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
				longitude : lastPosition.B,
			} );

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

	function addEventMarkerToMap(event) {
		if( ! event || vm.map === null ||
			event.location.coordinates.latitude == '' ||
			event.location.coordinates.longitude == '' )
			return false;

		// We add the random values, beacuse so we don't have any marker on the exact same location
		//   (that causes max zoom with no markers show...)
		var eventLatLng = new google.maps.LatLng(
			event.location.coordinates.latitude * (Math.random() * (max - min) + min),
			event.location.coordinates.longitude * (Math.random() * (max - min) + min)
		);

		var eventContentString = $compile(
			'<div class="clearfix" style="padding: 0 0 10px;">' +
			'<h4 style="margin-top: 0;">' + event.name + '</h4>' +
			'<p>' + event.location.full + '</p>' +
			'<p>Tip: ' + ConverterService.eventTypeToHumanType(event.type) + '</p>' +
			'<button class="button button-small button-calm button-block" ui-sref="events.detail({ id : ' + event.id + ', hideMenu : ' + vm.hideMenu + '  })">' +
				$filter('translate')('general.details') +
			'</button>' +
			'</div>'
		)($scope);
		eventContentString = eventContentString[0];

		var eventMarker = new google.maps.Marker({
			position: eventLatLng,
			// map: vm.map,
			animation: google.maps.Animation.DROP,
			icon: 'img/markers/' + ConverterService.eventTypeToIcon( event.type ) + '.png',
			flat: true,
		});

		vm.markers[event.id] = eventMarker;

		google.maps.event.addListener(
			vm.markers[event.id],
			'click',
			( function(marker, eventId) {
				return function() {
					vm.infoWindow.setContent( eventContentString );
					vm.infoWindow.open(vm.map, marker);
				};
			})(vm.markers[event.id], event.id)
		);

		return vm.markers[event.id];
	}

	function hideEventMarkerOnMap(eventId)
	{
		vm.markers[eventId].setMap(null);
	}

	function showEventMarkerOnMap(eventId)
	{
		if( vm.map != null &&
			vm.markers[eventId] )
		{
			//vm.markers[eventId].setMap(vm.map);

			vm.validMarkers.push( vm.markers[eventId] );
		}
	}

	/**
	 * When we change the search text or event types are beeing (un)checked,
	 *  we need to trigger this funtion, to show the right markers (regarding the filters)
	 */
	function reloadMarkers(args)
	{
		vm.filterArgs = args;

		var searchText = args.searchText;
		var eventTypes = args.eventTypes;
		var haveEventTypes = Object.keys(eventTypes).length > 0;

		vm.validEvents = $filter('filter')(vm.events, searchText);
		var validEventsIds = [];

		for (var i = vm.validEvents.length - 1; i >= 0; i--) {
			var validEvent = vm.validEvents[i];

			validEventsIds.push(validEvent.id);
		};

		if( vm.events.length )
		{
			vm.validMarkers = []; // Reload the current valid markers...

			for (var i = vm.events.length - 1; i >= 0; i--) {
				var event = vm.events[i];

				if( validEventsIds.indexOf(event.id) !== -1 )
				{
					if( haveEventTypes )
					{
						if( typeof eventTypes[event.type] != 'undefined'
							&& eventTypes[event.type].checked )
							showEventMarkerOnMap(event.id);
						else
							hideEventMarkerOnMap(event.id);
					}
					else
						showEventMarkerOnMap(event.id);
				}
				else
					hideEventMarkerOnMap(event.id);
			}
		}

		if( vm.events.length )
		{
			if( vm.markerClusterer )
			{
				vm.markerClusterer.clearMarkers();
				vm.markerClusterer.addMarkers(vm.validMarkers);
			}
		}
	}

	function panToMyLocation()
	{
		var myLatLng = new google.maps.LatLng(
			UserService.getCoordinates('latitude'),
			UserService.getCoordinates('longitude')
		);

		vm.map.panTo(myLatLng);
	}
};

/********** Events Detail Controller **********/
function EventsDetailController(
	$rootScope, $scope, $ionicLoading,
	$stateParams, $state, $ionicNavBarDelegate,
	$filter, EventsService
)
{
	var vm = this;

	vm.event = {};
	vm.eventLoaded = false;
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
			template: $filter('translate')('events.detail.loadingText'),
		});

		EventsService
			.getById($stateParams.id)
			.then( function(response) {
				vm.event = response;

				vm.eventLoaded = true;

	           	$ionicLoading.hide();
			}, function(error) {
				console.log(error);

				$state.go('events.list');
			})
		;
	}

	function goBack()
	{
		if( hasHistory() )
			historyGoBack();
		else
			$state.go('events.list');
	}
};
