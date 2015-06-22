angular
	.module('application')
	
	.controller('MembersAreaLoginController', MembersAreaLoginController)
;

function MembersAreaLoginController(
	$scope, $rootScope, $ionicPopup, 
	$state, $ionicLoading, $filter,
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

	/***** Function calls ******/
	vm.submitForm = submitForm;

	/***** Functions *****/
	function submitForm()
	{
		$ionicLoading.show({
			template: $filter('translate')('login.loadingText'),
		});

		UserService
			.login(vm.data)
			.then( function(response) {
				$ionicLoading.hide();

				if( typeof response.error == 'undefined' )
					$state.go('members-area.me.profile');
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
				$ionicLoading.hide();

				var popup = $ionicPopup.show({
					template: JSON.stringify(error),
					title: $filter('translate')('general.error'),
					buttons: [{ 
						text: $filter('translate')('general.close'),
						type: 'button-positive',
						onTap: function(e) {
							popup.close();
						}
					}],
				});
			});
		;
	}
};