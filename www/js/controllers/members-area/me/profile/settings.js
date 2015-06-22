angular
	.module('application')
	
	.controller('MembersAreaMeProfileSettingsController', MembersAreaMeProfileSettingsController)
;


function MembersAreaMeProfileSettingsController(
	$scope, $rootScope, $ionicPopup, 
	$ionicLoading, $state, $timeout,
	$filter, UserService
) 
{
	var vm = this;

	if( ! UserService.isLogined() )
		$state.go('members-area.login');

	vm.data = {};

	UserService
		.getMe(true)
		.then( function(response) {
			vm.data = response;
		})
	;

	/***** Function calls ******/
	vm.submitForm = submitForm;
	vm.pickImageFromGallery = pickImageFromGallery;
	vm.takeAPicture = takeAPicture;
	vm.fileChanged = fileChanged;

	/***** Functions *****/
	function pickImageFromGallery()
	{
		if( isDevice() )
		{
			$ionicLoading.show({
				template: $filter('translate')('members-area.profile.settings.savingPictureText'),
			});

			navigator.camera.getPicture(
				function(imageData) {
					$ionicLoading.hide();

					vm.data.image = "data:image/jpeg;base64," + imageData;
				}, 
				function(error) {
					$ionicLoading.hide();
					
					console.log('Error: ' + error);
				}, 
				{
					sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
					destinationType: Camera.DestinationType.DATA_URL,
					correctOrientation: true,
					encodingType: Camera.EncodingType.PNG,
					targetWidth: 800,
				}
			);
		}
		else
		{
			$timeout( function() {
				angular.element('#profile-file').trigger('click');
			}, 100);
		}
	}

	function fileChanged(files, event)
	{
		vm.data.file = files[0];

		$timeout( function() {
			var fileReader = new FileReader();
			fileReader.readAsDataURL(vm.data.file);
			fileReader.onload = function(e) {
				$timeout( function() {
					vm.data.image = e.target.result;
				});
			}
		}, 100);
	}

	function takeAPicture()
	{
		if( isDevice() )
		{
			$ionicLoading.show({
				template: $filter('translate')('members-area.profile.settings.savingPictureText'),
			});

			navigator.camera.getPicture(
				function(imageData) {
					$ionicLoading.hide();

					vm.data.image = "data:image/jpeg;base64," + imageData;
				}, 
				function(error) {
					$ionicLoading.hide();

					console.log('Error: ' + error);
				}, 
				{
					sourceType : Camera.PictureSourceType.CAMERA,
					destinationType: Camera.DestinationType.DATA_URL,
					correctOrientation: true,
					encodingType: Camera.EncodingType.PNG,
					targetWidth: 800,
				}
			);
		}
		else
		{
			$timeout( function() {
				angular.element('#profile-file').trigger('click');
			}, 100);
		}
	}

	function submitForm()
	{
		$ionicLoading.show({
			template: $filter('translate')('members-area.profile.settings.loadingText'),
		});

		UserService
			.saveMe(vm.data)
			.then( function(response) {
				$ionicLoading.hide();

				if( typeof response.error == 'undefined' )
				{
					var popup = $ionicPopup.show({
						template: $filter('translate')('members-area.profile.settings.successText'),
						title: $filter('translate')('general.success'),
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
}