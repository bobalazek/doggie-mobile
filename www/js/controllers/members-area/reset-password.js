angular
	.module('application')
	
	.controller('MembersAreaResetPasswordController', MembersAreaResetPasswordController)
;

function MembersAreaResetPasswordController(
	$scope, $rootScope, $ionicPopup, 
	$state, $ionicLoading, $filter,
	UserService
) 
{
	var vm = this;

	if( UserService.isLogined() )
		$state.go('members-area.profile');

	vm.data = {
		'email' : '',
	};

	vm.submitForm = submitForm;

	/***** Submit Form *****/
	function submitForm()
	{
		$ionicLoading.show({
			template: $filter('translate')('resetPassword.loadingText'),
		});

		UserService
			.resetPassword(vm.data)
			.then( function(response) {
				$ionicLoading.hide();

				if( typeof response.error == 'undefined' )
				{
					var popup = $ionicPopup.show({
						template: $filter('translate')('resetPassword.successText'),
						title: $filter('translate')('general.thanks'),
						buttons: [{ 
							text: $filter('translate')('general.close'),
							type: 'button-positive',
							onTap: function(e) {
								popup.close();
							}
						}],
					});
				}
				else
				{
					var popup = $ionicPopup.show({
						template:  response.error.message,
						title: $filter('translate')('general.error'),
						buttons: [{ 
							text: $filter('translate')('general.close'),
							type: 'button-positive',
							onTap: function(e) {
								popup.close();
							}
						}],
					});
				}
			}, function(error) {
				console.log(error);
			});
		;
	}
};