angular
	.module('application')

	.factory('EventsService', function($http, $q, $rootScope, UserService) {
		var EventsService = {};

		var events = [];
		var eventTypes = [];

		EventsService.getAll = function() {
			var deferred = $q.defer();

			if( events.length == 0 )
			{
				$http
					.get(apiUrl + '/events/')
					.then( function(response) {
						events = response.data.results
						
						deferred.resolve( events );
					}, function(error) {
						deferred.reject( error );
					})
				;
			}
			else
				deferred.resolve( events );

			return deferred.promise;
		};

		EventsService.getTypes = function() {
			var deferred = $q.defer();

			if( eventTypes.length == 0 )
			{
				$http
					.get(apiUrl + '/events/types')
					.then( function(response) {
						eventTypes = response.data.results;

						deferred.resolve( eventTypes );
					}, function(error) {
						deferred.reject( error );
					})
				;
			}
			else
				deferred.resolve( eventTypes );

			return deferred.promise;
		};

		EventsService.getById = function(id) {
			var deferred = $q.defer();

			$http
				.get(apiUrl + '/events/' + id)
				.then( function(response) {
					deferred.resolve( response.data );
				}, function(error) {
					deferred.reject( error );
				});
			;

			return deferred.promise;
		};

		return EventsService;
	})
;