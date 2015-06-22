angular
	.module('application')

	.factory('PostsService', function($http, $q, $rootScope, UserService) {
		var PostsService = {};

		var posts = [];
		var timeLastFetched = 0;

		PostsService.getAll = function() {
			var deferred = $q.defer();

			var currentTime = Math.floor(Date.now() / 1000);

			if( posts.length == 0 || 
				currentTime - timeLastFetched > 60 ) // When It's older then 60 sec
			{
				$http
					.get(apiUrl + '/posts/')
					.then( function(response) {
						posts = response.data.results

						timeLastFetched = Math.floor(Date.now() / 1000);

						deferred.resolve( posts );
					}, function(error) {
						deferred.reject( error );
					})
				;
			}
			else
				deferred.resolve( posts );

			return deferred.promise;
		};

		PostsService.getById = function(id) {
			var deferred = $q.defer();

			$http
				.get(apiUrl + '/posts/' + id)
				.then( function(response) {
					deferred.resolve( response.data );
				}, function(error) {
					deferred.reject( error );
				});
			;

			return deferred.promise;
		};

		return PostsService;
	})
;