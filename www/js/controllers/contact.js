angular
	.module('application')
	
	.controller('ContactController', ContactController)
;


function ContactController(
	$scope, $rootScope, $ionicPopup, 
	$http, $filter
) 
{
	$scope.data = {};

	$scope.send = function() {
		$scope.valid = true;

		if( ! $scope.data.name ||
			! $scope.data.email ||
			! $scope.data.message )
			$scope.valid = false;

		if( $scope.valid )
		{
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
					name : $scope.data.name,
					email : $scope.data.email,
					message : $scope.data.message,
				},
			})
				.then( function(response) {
					$scope.popup = $ionicPopup.show({
						template: $filter('translate')('contact-us.successText'),
						title: $filter('translate')('general.thanks'),
						buttons: [{ 
      						text: $filter('translate')('general.close'),
      						type: 'button-positive',
      						onTap: function(e) {
      							$scope.popup.close();
      						}
      					}],
					});

					$scope.data.name = '';
					$scope.data.email = '';
					$scope.data.message = '';
				}, function(error) {
					console.log(error);
				});
			;
		}
		else
		{
			$scope.popup = $ionicPopup.show({
				template: $filter('translate')('contact-us.errorText'),
				title: $filter('translate')('general.warning'),
				buttons: [{ 
					text: $filter('translate')('general.close'),
					type: 'button-positive',
					onTap: function(e) {
						$scope.popup.close();
					}
				}],
			});
		}
	};
};