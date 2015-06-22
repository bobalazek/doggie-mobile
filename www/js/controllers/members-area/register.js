angular
	.module('application')
	
	.controller('MembersAreaRegisterController', MembersAreaRegisterController)
;

function MembersAreaRegisterController(
	$scope, $rootScope, $ionicPopup, 
	$ionicLoading, $state, $filter,
	UserService
) 
{
	var vm = this;

	if( UserService.isLogined() )
		$state.go('members-area.me.profile');

	vm.data = {
		'email' : '',
		'password' : '',
	};

	/***** Function calls *****/
	vm.submitForm = submitForm;

	/***** Functions *****/
	function submitForm()
	{
		$ionicLoading.show({
			template: $filter('translate')('register.loadingText'),
		});

		UserService
			.register(vm.data)
			.then( function(response) {
				$ionicLoading.hide();

				if( typeof response.error == 'undefined' )
				{
					var popup = $ionicPopup.show({
						template: $filter('translate')('register.successText'),
						title: $filter('translate')('general.thanks'),
						buttons: [{ 
							text: $filter('translate')('general.close'),
							type: 'button-positive',
							onTap: function(e) {
								popup.close();

								$state.go('members-area.me.profile');
							}
						}],
					});
				}
				else
				{
					var popup = $ionicPopup.show({
						template: response.error.message,
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