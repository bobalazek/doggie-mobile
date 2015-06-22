angular
	.module('application')

	.factory('AnimalsService', function($http, $q, $rootScope) {
		var AnimalsService = {};

		var animals = [];
		var animalSpecies = [];

		AnimalsService.getAll = function(which) {
			var deferred = $q.defer();

			if( /*animals.length == 0*/ true )
			{
				$http
					.get( apiUrl + '/animals/?which=' + which )
					.then( function(response) {
						animals = response.data.results
	
						deferred.resolve( animals );
					}, function(error) {
						deferred.reject( error );
					})
				;
			}
			else
				deferred.resolve( animals );

			return deferred.promise;
		};

		AnimalsService.getSpecies = function() {
			var deferred = $q.defer();

			if( animalSpecies.length == 0 )
			{
				$http
					.get(apiUrl + '/animals/species')
					.then( function(response) {
						animalSpecies = response.data.results;

						deferred.resolve( animalSpecies );
					}, function(error) {
						deferred.reject( error );
					})
				;
			}
			else
				deferred.resolve( animalSpecies );

			return deferred.promise;
		};

		AnimalsService.getById = function(id) {
			var deferred = $q.defer();

			$http
				.get(apiUrl + '/animals/' + id)
				.then( function(response) {
					deferred.resolve( response.data );
				}, function(error) {
					deferred.reject( error );
				});
			;

			return deferred.promise;
		};

		return AnimalsService;
	})
;