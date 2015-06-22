angular
	.module('application')
	
	.controller('MembersAreaChatController', MembersAreaChatController)
;

function MembersAreaChatController(
	$scope, $rootScope, $ionicPopup, 
	$state, $ionicLoading, $filter, $interval,
	ChatService
) 
{
	var vm = this;

	vm.chatMessages = [];
	vm.chatMessageText = '';

	/***** Initializers *****/
	initializeListener();
	initializeChatMessages();

	/***** Function calls *****/
	vm.submitForm = submitForm;

	/***** Functions *****/
	function initializeListener()
	{
		$interval( function() {
			initializeChatMessages();
		}, 10000);
	}
	function initializeChatMessages()
	{
		ChatService
			.getAll()
			.then( function(response) {
				vm.chatMessages = response;
			})
		;
	}

	function submitForm()
	{
		ChatService
			.newMessage(vm.chatMessageText)
			.then( function(response) {
				$ionicLoading.hide();

				vm.chatMessageText = '';
				initializeChatMessages();

				if( typeof response.error == 'undefined' )
				{
					var popup = $ionicPopup.show({
						template: response.message,
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
				
				console.log(error);
			})
		;
	}
}