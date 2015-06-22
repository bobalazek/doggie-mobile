angular
	.module('application')
	
	.controller('MembersAreaMePetsController', MembersAreaMePetsController)
	.controller('MembersAreaMePetsNewController', MembersAreaMePetsNewController)
	.controller('MembersAreaMePetsDetailController', MembersAreaMePetsDetailController)
	.controller('MembersAreaMePetsEditController', MembersAreaMePetsEditController)
	.controller('MembersAreaMePetsRemoveController', MembersAreaMePetsRemoveController)
;

function MembersAreaMePetsController(
	$scope, $rootScope, $ionicPopup, 
	$state, $ionicLoading, $timeout,
	$filter, UserService, ConverterService
) 
{
	var vm = this;

	vm.pets = [];

	/***** Function Calls *****/
	vm.removePet = removePet;
	vm.animalAgeToHumanAge = animalAgeToHumanAge;

	/***** Initializers *****/
	getPets();

	$scope.$on('mePetsChanged', function() {
		getPets(forceNewData = true); // Instead of the cached once...
	});

	/***** Functions *****/
	function getPets(forceNewData)
	{
		UserService
			.getPets(forceNewData)
			.then( function(response) {
				vm.pets = response;
			})
		;
	}

	function removePet(petId)
	{
		var popup = $ionicPopup.show({
			template: $filter('translate')('members-area.pets.remove.confirmText'),
			title: $filter('translate')('general.warning'),
			buttons: [{ 
				text: $filter('translate')('general.confirm'),
				type: 'button-assertive',
				onTap: function(e) {
					$ionicLoading.show({
						template: $filter('translate')('members-area.pets.remove.loadingText'),
					});

					UserService
						.removePet(petId)
						.then( function(response) {
							$ionicLoading.hide();

							openRemoveSuccessPopup();

							$rootScope.$broadcast('mePetsChanged');
						})
					;
				}
			}, { 
				text: $filter('translate')('general.cancel'),
				type: 'button-positive',
				onTap: function(e) {
					popup.close();
				}
			}],
		});
	}

	function openRemoveSuccessPopup()
	{
		var popup = $ionicPopup.show({
			template: $filter('translate')('members-area.pets.remove.successText'),
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

	function animalAgeToHumanAge(age)
	{
		return ConverterService.animalAgeToHumanAge(age);
	}
}

function MembersAreaMePetsNewController(
	$scope, $rootScope, $ionicPopup, 
	$state, $ionicLoading, $timeout,
	$filter, UserService
) 
{
	var vm = this;

	vm.data = {
		image : 'img/placeholders/animal.png',
		file : null, // Only used for desktop

		name : '',
		species : 'dog',
		breed : '',
		gender : 'male',
		birthdate : new Date( moment().subtract(1, 'year') ),
		weight : '',
		size : '',

		isTattooed : false,
		tattooNumber : 0,
		timeTattooed : new Date('2009-01-01'),

		isMicrochipped : false,
		microchipNumber : 0,
		microchipLocation : '',
		timeMicrochipped : new Date('2009-01-01'),

		isVaccinated : false,
		timeVaccinatedLast : new Date( moment().subtract(11, 'month') ),
		timeVaccinatedNext : new Date( moment().add(1, 'month') ),
		
		sizeNeck : 0,
		sizeChest : 0,

		additionalInformation : '',
	};

	/***** Function Calls *****/
	vm.formSubmit = formSubmit;
	vm.pickImageFromGallery = pickImageFromGallery;
	vm.takeAPicture = takeAPicture;
	vm.fileChanged = fileChanged;

	/***** Functions *****/
	function pickImageFromGallery()
	{
		if( isDevice() )
		{
			$ionicLoading.show({
				template: $filter('translate')('members-area.pets.uploadingImageText'),
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
				angular.element('#pet-file').trigger('click');
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
				template: $filter('translate')('members-area.pets.savingImageText'),
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
				angular.element('#pet-file').trigger('click');
			}, 100);
		}
	}

	function formSubmit()
	{
		$ionicLoading.show({
			template: $filter('translate')('members-area.pets.new.loadingText'),
		});

		UserService
			.newPet(vm.data)
			.then( function(response) {
				$ionicLoading.hide();

				if( typeof response.error == 'undefined' )
				{
					var popup = $ionicPopup.show({
						template: response.message,
						title: $filter('translate')('general.thanks'),
						buttons: [{ 
							text: $filter('translate')('general.close'),
							type: 'button-positive',
							onTap: function(e) {
								$rootScope.$broadcast('mePetsChanged');

								$state.go('members-area.me.pets.list');
							}
						}],
					});
				}
				else
				{
					var popup = $ionicPopup.show({
						template: response.error.errors.join('<br />'),
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
				
				console.log(error);
			})
		;
	}
}

function MembersAreaMePetsDetailController(
	$scope, $rootScope, $ionicPopup, 
	$state, $ionicLoading, $timeout,
	$stateParams, UserService
) 
{
	var vm = this;

	vm.petLoaded = false;
	vm.pet = {};
	vm.petId = $stateParams.id;

	/***** Initializers *****/
	getPet();

	/***** Functions *****/
	function getPet()
	{
		UserService
			.getPet(vm.petId)
			.then( function(response) {
				vm.pet = response;

				vm.petLoaded = true;
			})
		;
	}
}

function MembersAreaMePetsEditController(
	$scope, $rootScope, $ionicPopup, 
	$state, $ionicLoading, $timeout,
	$stateParams, $filter, UserService
) 
{
	var vm = this;

	vm.data = {};
	vm.petId = $stateParams.id;

	/***** Initializers *****/
	getPet();

	vm.formSubmit = formSubmit;
	vm.pickImageFromGallery = pickImageFromGallery;
	vm.takeAPicture = takeAPicture;
	vm.fileChanged = fileChanged;

	function getPet()
	{
		UserService
			.getPet(vm.petId)
			.then( function(response) {
				// Prepare some data first
				response.image = response.image.url;
				response.birthdate = prepateDate( response.birthdate );
				response.timeMicrochipped = prepateDate( response.timeMicrochipped );
				response.timeTattooed = prepateDate( response.timeTattooed );
				response.timeVaccinatedLast = prepateDate( response.timeVaccinatedLast );
				response.timeVaccinatedNext = prepateDate( response.timeVaccinatedNext );
				response.microchipNumber = parseInt( response.microchipNumber );
				response.tattooNumber = parseInt( response.tattooNumber );

				vm.data = response;
			})
		;

		function prepateDate(date)
		{
			var output = '';

			var tmp = date.date;
			tmp = tmp.split(' ');

			output = tmp[0];

			return new Date( output );
		}
	}

	/***** Functions *****/
	function pickImageFromGallery()
	{
		if( isDevice() )
		{
			$ionicLoading.show({
				template: $filter('translate')('members-area.pets.uploadingImageText'),
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
				angular.element('#pet-file').trigger('click');
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
				template: $filter('translate')('members-area.pets.savingImageText'),
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
				angular.element('#pet-file').trigger('click');
			}, 100);
		}
	}

	function formSubmit()
	{
		$ionicLoading.show({
			template: $filter('translate')('members-area.pets.edit.loadingText'),
		});

		UserService
			.editPet(vm.petId, vm.data)
			.then( function(response) {
				$ionicLoading.hide();

				if( typeof response.error == 'undefined' )
				{
					var popup = $ionicPopup.show({
						template: $filter('translate')('members-area.pets.edit.successText'),
						title: $filter('translate')('general.thanks'),
						buttons: [{ 
							text: $filter('translate')('general.close'),
							type: 'button-positive',
							onTap: function(e) {
								$rootScope.$broadcast('mePetsChanged');

								$state.go('members-area.me.pets.list');
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
	}
}

function MembersAreaMePetsRemoveController(
	$scope, $rootScope, $ionicPopup, 
	$state, $ionicLoading, $timeout,
	$stateParams, UserService
) 
{
	var vm = this;

	vm.pet = {};
	vm.petId = $stateParams.id;

	/***** Initializers *****/
	getPet();

	/***** Functions *****/
	function getPet()
	{
		UserService
			.getPet(vm.petId)
			.then( function(response) {
				vm.pet = response;
			})
		;
	}
}
