angular
	.module('application')

	.factory('ChatService', function($http, $q, $rootScope, UserService) {
		var ChatService = {};

		ChatService.getAll = function() {
			var deferred = $q.defer();

			$http
				.get(apiUrl + '/members-area/chat/messages')
				.then( function(response) {
					deferred.resolve( response.data.results );
				}, function(error) {
					deferred.reject( error );
				})
			;

			return deferred.promise;
		};

		ChatService.newMessage = function(message) {
			var data = {
				content : message,
			};
			var deferred = $q.defer();

			$http({
				method : 'post',
				url : apiUrl + '/members-area/chat/messages?token=' + UserService.getToken(),
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

		return ChatService;
	})
;