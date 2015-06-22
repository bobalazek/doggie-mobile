angular
	.module('application')

	.factory('PlacesService', function($http, $q, $rootScope, UserService) {
		var PlacesService = {};

		var places = [];
		var placeTypes = [];

		PlacesService.getById = function(id) {
			var deferred = $q.defer();

			$http
				.get(apiUrl + '/places/' + id)
				.then( function(response) {
					deferred.resolve( response.data );
				}, function(error) {
					deferred.reject( error );
				});
			;

			return deferred.promise;
		};

		PlacesService.getAll = function() {
			var deferred = $q.defer();

			if( places.length == 0 )
			{
				$http
					.get(apiUrl + '/places/')
					.then( function(response) {
						places = PlacesService.calculateDistanceFromMyself(
							response.data.results
						);

						deferred.resolve( places );
					}, function(error) {
						deferred.reject( error );
					})
				;
			}
			else
				deferred.resolve( places );

			return deferred.promise;
		};

		PlacesService.getTypes = function() {
			var deferred = $q.defer();

			if( placeTypes.length == 0 )
			{
				$http
					.get(apiUrl + '/places/types')
					.then( function(response) {
						placeTypes = response.data.results;

						deferred.resolve( placeTypes );
					}, function(error) {
						deferred.reject( error );
					})
				;
			}
			else
				deferred.resolve( placeTypes );

			return deferred.promise;
		};

		PlacesService.calculateDistanceFromMyself = function(tempResults) {
			var results = [];

			for( var i = 0; i < tempResults.length; i++ )
			{
				var result = tempResults[i];

				result.distanceFromMyself = PlacesService.getDistance(
					result.location.coordinates
				);

				results[results.length] = result;
			}

			return results;
		};

		PlacesService.getDistance = function(placeCoordinates) {
			var myCoordinates = UserService.getCoordinates();
			var result = 0;
			var lat1 = parseFloat(placeCoordinates.latitude);
			var lon1 = parseFloat(placeCoordinates.longitude);
			var lat2 = parseFloat(myCoordinates.latitude);
			var lon2 = parseFloat(myCoordinates.longitude);

			function toRad(Value) 
			{
				return Value * Math.PI / 180;
			}

			var R = 6371; // km
			var dLat = toRad(lat2-lat1);
			var dLon = toRad(lon2-lon1);
			var lat1 = toRad(lat1);
			var lat2 = toRad(lat2);

			var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
			        Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
			var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
			var d = R * c;

			return parseFloat( d.toFixed(2) );
		};

		PlacesService.recalculateDistances = function() {
			return places = PlacesService
				.calculateDistanceFromMyself(
					places
				)
			;
		};

		return PlacesService;
	})
;