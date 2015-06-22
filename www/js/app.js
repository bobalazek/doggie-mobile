angular
	.module('application', [
		'ionic', 
		'ngCordova',
		'angularMoment',
		'pascalprecht.translate',
		'angularFileUpload',
	])

	.run( function(
		$ionicPlatform, $window, 
		$state, $location, $rootScope,
		$cordovaSplashscreen, $ionicSideMenuDelegate,
		GeolocationService
	) {
		document.addEventListener('touchstart', function (event) {
		    // workaround for Android
		    if ($ionicSideMenuDelegate.isOpenLeft()) {
		        event.preventDefault();
		    }
		});

		$ionicPlatform.ready( function() {
			/* if(navigator.splashscreen)
				navigator.splashscreen.show(); */

			/* if( window.StatusBar )
				StatusBar.hide(); */

			if( window.cordova && 
				window.cordova.plugins.Keyboard)
				cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

			if( window.StatusBar )
				StatusBar.styleDefault();

			if( window.plugins && 
				window.plugins.insomnia )
				window.plugins.insomnia.keepAwake();

			// Internet connection check
			if( navigator.connection &&
				navigator.connection.type == Connection.NONE )
				$state.go('no-internet-connection');

			// Events
			document.addEventListener(
				'offline', 
				function() {
					$state.go('no-internet-connection');
				}, 
				false
			);

			document.addEventListener(
				'online', 
				function() {
					if( $location.path() == '/no-internet-connection' )
						$state.go('places.list');
				}, 
				false
			);

			if( typeof AdMob != 'undefined' ) 
			{
				AdMob.setOptions({
					isTesting : isTesting,
				});

				/*AdMob.createBanner({
					adId: admobid.banner, 
					position: AdMob.AD_POSITION.BOTTOM_CENTER, 
					autoShow: true 
				});*/

				AdMob.prepareInterstitial({
					adId: admobid.interstitial, 
					autoShow: false
				});
			}

			if( $window.localStorage['alreadySeenIntro'] 
				&& $location.path() == '/' )
				$state.go('places.list');

			$rootScope.$apply();

			// Now hide it!	
			// To-Do: Make this crap functional...
			setTimeout(function() {
				if( navigator.splashscreen )
					navigator.splashscreen.hide();
			}, 2000);
		});
	})

	.config( function(
		$stateProvider, $urlRouterProvider,  $httpProvider,
		$translateProvider, $ionicConfigProvider, $sceProvider
	) {
		// SCE
		$sceProvider.enabled(false);

		// Http
		$httpProvider.interceptors.push( function($rootScope) {
			return {
				request : function(config) {
					if( typeof config.headers == 'object' )
						config.headers['Locale'] = defaultLocale;

					return config;
				},
			};
		});

		// Cache
		$ionicConfigProvider.views.transition('none');
		$ionicConfigProvider.views.maxCache(50);

 		// Translation
		$translateProvider.useStaticFilesLoader({
			prefix: 'locales/',
			suffix: '.json',
		});

		$translateProvider.preferredLanguage(defaultLocale);

		// States
		$urlRouterProvider.when("/app", "/app/places");
		$ionicConfigProvider.views.maxCache(0);

  		$stateProvider
			.state('index', {
				url: "/",
				templateUrl: "templates/index.html",
			})

			// App (new version)
			.state('app', {
				url: "/app",
				templateUrl: "templates/app.html",
				controller: "AppController as appScope",
			})
			// App - Places
			.state('app.places', {
				url: "/places",
				templateUrl: "templates/app/places.html",
				views: {
					"list" : {
						templateUrl: "templates/app/places/list.html",
					},
					"map" : {
						templateUrl: "templates/app/places/map.html",
					},
				},
			})
			// App - Events
			.state('app.events', {
				url: "/events",
				templateUrl: "templates/app/events.html",
				views: {
					"list" : {
						templateUrl: "templates/app/events/list.html",
					},
					"map" : {
						templateUrl: "templates/app/events/map.html",
					},
				},
			})
			// App - Animals
			.state('app.animals', {
				url: "/animals",
				templateUrl: "templates/app/animals.html",
			})
			// App - Posts
			.state('app.posts', {
				url: "/posts",
				templateUrl: "templates/app/posts.html",
				views: {
					"list" : {
						templateUrl: "templates/app/posts/list.html",
					},
				},
			})
			// App - More
			.state('app.more', {
				url: "/more",
				templateUrl: "templates/app/more.html",
			})
			// App - Members-area
			.state('app.members-area', {
				url: "/members-area",
				templateUrl: "templates/app/members-area.html",
			})

			//////////// OLD / ACTUAL VERSION //////////////

			// Places
			.state('places', {
				url: "/places",
				abstract: true,
				templateUrl: "templates/places.html",
				controller: "PlacesController as placesScope",
			})
			.state('places.list', {
				url: "/list",
				templateUrl: "templates/places/list.html",
				controller: "PlacesListController as placesListScope",
			})
			.state('places.map', {
				url: "/map",
				templateUrl: "templates/places/map.html",
				controller: "PlacesMapController as placesMapScope",
			})
			.state('places.detail', {
				url: "/{id}/{hideMenu}",
				templateUrl: "templates/places/detail.html",
				controller: "PlacesDetailController as placesDetailScope",
				cache: false,
			})

			// Events
			.state('events', {
				url: "/events",
				abstract: true,
				templateUrl: "templates/events.html",
				controller: "EventsController as eventsScope",
			})
			.state('events.list', {
				url: "/list",
				templateUrl: "templates/events/list.html",
				controller: "EventsListController as eventsListScope",
			})
			.state('events.map', {
				url: "/map",
				templateUrl: "templates/events/map.html",
				controller: "EventsMapController as eventsMapScope",
			})
			.state('events.detail', {
				url: "/{id}/{hideMenu}",
				templateUrl: "templates/events/detail.html",
				controller: "EventsDetailController as eventsDetailScope",
			})

			// Animals
			.state('animals', {
				url: "/animals",
				abstract: true,
				templateUrl: "templates/animals.html",
				controller: "AnimalsController as animalsScope",
			})
			.state('animals.list', {
				url: "/list/{which}",
				templateUrl: "templates/animals/list.html",
				controller: "AnimalsListController as animalsListScope",
			})
			.state('animals.detail', {
				url: "/{id}/{hideMenu}",
				templateUrl: "templates/animals/detail.html",
				controller: "AnimalsDetailController as animalsDetailScope",
			})

			// Posts
			.state('posts', {
				url: "/posts",
				abstract: true,
				templateUrl: "templates/posts.html",
				controller: "PostsController as postsScope",
			})
			.state('posts.list', {
				url: "/list",
				templateUrl: "templates/posts/list.html",
				controller: "PostsListController as postsListScope",
			})
			.state('posts.detail', {
				url: "/{id}/{hideMenu}",
				templateUrl: "templates/posts/detail.html",
				controller: "PostsDetailController as postsDetailScope",
			})

			// Members Area
			.state('members-area', {
				url: "/members-area",
				abstract: true,
				templateUrl: "templates/members-area.html",
			})
			.state('members-area.logout', {
				url: "/logout",
				template: 'Logout',
				controller: function(UserService, $state) {
					UserService.logout();

					return $state.go('members-area.login');
				},
			})
			.state('members-area.login', {
				url: "/login",
				templateUrl: "templates/members-area/login.html",
				controller: "MembersAreaLoginController as membersAreaLoginScope",
			})
			.state('members-area.register', {
				url: "/register",
				templateUrl: "templates/members-area/register.html",
				controller: "MembersAreaRegisterController as membersAreaRegisterScope",
			})
			.state('members-area.reset-password', {
				url: "/reset-password",
				templateUrl: "templates/members-area/reset-password.html",
				controller: "MembersAreaResetPasswordController as membersAreaResetPasswordScope",
			})
			// Me
			.state('members-area.me', {
				url: "/me",
				abstract: true,
				template: '<ion-nav-view></ion-nav-view>',
			})
			// Me - Profile
			.state('members-area.me.profile', {
				url: "/profile",
				templateUrl: "templates/members-area/me/profile.html",
			})
			.state('members-area.me.profile-settings', {
				url: "/profile/settings",
				controller: "MembersAreaMeProfileSettingsController as membersAreaMeProfileSettingsScope",
				templateUrl: "templates/members-area/me/profile/settings.html",
			})
			// Me - Pets
			.state('members-area.me.pets', {
				url: "/pets",
				abstract: true,
				template: '<ion-nav-view></ion-nav-view>',
				controller: "MembersAreaMePetsController as membersAreaMePetsScope",
			})
			.state('members-area.me.pets.list', {
				url: "/list",
				templateUrl: "templates/members-area/me/pets/list.html",
			})
			.state('members-area.me.pets.new', {
				url: "/new",
				templateUrl: "templates/members-area/me/pets/new.html",
				controller: "MembersAreaMePetsNewController as membersAreaMePetsNewScope",
			})
			.state('members-area.me.pets.detail', {
				url: "/:id",
				templateUrl: "templates/members-area/me/pets/detail.html",
				controller: "MembersAreaMePetsDetailController as membersAreaMePetsDetailScope",
			})
			.state('members-area.me.pets.edit', {
				url: "/:id/edit",
				templateUrl: "templates/members-area/me/pets/edit.html",
				controller: "MembersAreaMePetsEditController as membersAreaMePetsEditScope",
			})
			// Members Area - Chat
			.state('members-area.chat', {
				url: "/chat",
				templateUrl: "templates/members-area/chat.html",
				controller: "MembersAreaChatController as membersAreaChatScope",
			})

			// More
			.state('more', {
				url: "/more",
				abstract: true,
				templateUrl: "templates/more.html",
			})
			// Help Animals
			.state('more.help-animals', {
				url: "/help-animals",
				templateUrl: "templates/more/help-animals.html",
				controller: "HelpAnimalsController as helpAnimalsScope",
			})

			// Settings
			.state('more.settings', {
				url: "/settings",
				templateUrl: "templates/more/settings.html",
				controller: "SettingsController as settingsScope",
			})

			// Contact
			.state('more.contact', {
				url: "/contact",
				templateUrl: "templates/more/contact.html",
				controller: "ContactController as contactScope",
			})

			// Information
			.state('more.information', {
				url: "/information",
				templateUrl: "templates/more/information.html",
			})

			// Information
			.state('more.faq', {
				url: "/faq",
				templateUrl: "templates/more/faq.html",
			})

			// No Internet connection
			.state('no-internet-connection', {
				url: "/no-internet-connection",
				templateUrl: "templates/no-internet-connection.html",
			})
		;

		$urlRouterProvider.otherwise('/');
	})
;