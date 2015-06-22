angular
	.module('application')

	.factory('ConverterService', function($filter) {
		var ConverterService = {};

		/***** Animals *****/
		ConverterService.animalTypeToHumanType = function(type) 
		{
			if( type == 'dog' )
				type = $filter('translate')('animals.dog');
			else if( type == 'cat' )
				type = $filter('translate')('animals.cat');
			else if( type == 'rabbit' )
				type = $filter('translate')('animals.rabbit');
			else if( type == 'hamster' )
				type = $filter('translate')('animals.rabbit');
			else if( type == 'bird' )
				type = $filter('translate')('animals.bird');
			else if( type == 'other' )
				type = $filter('translate')('general.other');

			return type;
		};

		ConverterService.animalGenderToHumanGender = function(gender) 
		{
			if( gender == 'male' )
				gender = $filter('translate')('general.male');
			else if( gender == 'female' )
				gender = $filter('translate')('animals.female');

			return gender;
		};

		ConverterService.animalAgeToHumanAge = function(age)
		{
			var output = '';

			if( age )
			{
				var ageArray = age.split(' ');
				var years = parseInt( ageArray[0] );
				var months = parseInt( ageArray[1] );

				var outputArr = [];

				if( years > 0 )
					outputArr.push(years + ' let');

				if( months > 0 )
					outputArr.push(months + ' mesecev');

				if( years == 0 && months == 0 )
					outputArr.push('manj kot mesec');

				output = outputArr.join(' ');
			}

			return output;
		}

		/***** Places *****/
		ConverterService.placeTypeToHumanType = function(type) 
		{
			if( type == 'other' )
				type = $filter('translate')('general.other');
			else if( type == 'bar' )
				type = $filter('translate')('places.types.bar');
			else if( type == 'park' )
				type = $filter('translate')('places.types.park');
			else if( type == 'dog_playground' )
				type = $filter('translate')('places.types.dogPlayground');
			else if( type == 'dog_nanny' )
				type = $filter('translate')('places.types.dogNanny');
			else if( type == 'dog_hotel' )
				type = $filter('translate')('places.types.dogHotel');
			else if( type == 'dog_saloon' )
				type = $filter('translate')('places.types.dogSaloon');
			else if( type == 'restaurant' )
				type = $filter('translate')('places.types.restaurant');
			else if( type == 'hotel' )
				type = $filter('translate')('places.types.hotel');
			else if( type == 'camp' )
				type = $filter('translate')('places.types.camp');
			else if( type == 'beach' )
				type = $filter('translate')('places.types.beach');
			else if( type == 'apartment' )
				type = $filter('translate')('places.types.apartment');
			else if( type == 'dog_school' )
				type = $filter('translate')('places.types.dogSchool');
			else if( type == 'dog_trainer' )
				type = $filter('translate')('places.types.dogTrainer');
			else if( type == 'veterinary' )
				type = $filter('translate')('places.types.veterinary');
			else if( type == 'shelter' )
				type = $filter('translate')('places.types.shelter');
			else if( type == 'society' )
				type = $filter('translate')('places.types.society');
			else if( type == 'dog_photography' )
				type = $filter('translate')('places.types.dogPhotography');
			else if( type == 'cemetery' )
				type = $filter('translate')('places.types.cemetery');
			else if( type == 'administration' )
				type = $filter('translate')('places.types.administration');
			else if( type == 'dog_walking' )
				type = $filter('translate')('places.types.dogWalking');
			else if( type == 'pet_shop' )
				type = $filter('translate')('places.types.petShop');

			return type;
		};

		ConverterService.placeTypeToIcon = function(type) 
		{
			if( type == 'other' )
				icon = 'mainroad';
			else if( type == 'dog_shopping' )
				icon = 'mall';
			else if( type == 'bar' )
				icon = 'bar';
			else if( type == 'park' )
				icon = 'forest';
			else if( type == 'dog_playground' )
				icon = 'dog_leash';
			else if( type == 'dog_nanny' )
				icon = 'nanny';
			else if( type == 'dog_hotel' )
				icon = 'hotel_0star';
			else if( type == 'dog_saloon' )
				icon = 'barber';
			else if( type == 'restaurant' )
				icon = 'restaurant';
			else if( type == 'hotel' )
				icon = 'hotel_0star';
			else if( type == 'camp' )
				icon = 'camping-2';
			else if( type == 'beach' )
				icon = 'beach';
			else if( type == 'apartment' )
				icon = 'apartment-3';
			else if( type == 'dog_school' )
				icon = 'school';
			else if( type == 'dog_trainer' )
				icon = 'childmuseum01';
			else if( type == 'veterinary' )
				icon = 'veterinary';
			else if( type == 'shelter' )
				icon = 'animal-shelter-export';
			else if( type == 'society' )
				icon = 'group-2';
			else if( type == 'dog_photography' )
				icon = 'photography';
			else if( type == 'cemetery' )
				icon = 'cemetary';
			else if( type == 'administration' )
				icon = 'administration';
			else
				icon = 'smiley_happy';

			return icon;
		}

		/***** Events *****/
		ConverterService.eventTypeToHumanType = function(type) 
		{
			if( type == 'meeting' )
				type = $filter('translate')('events.types.meeting');
			else if( type == 'show' )
				type = $filter('translate')('events.types.show');
			else if( type == 'contest' )
				type = $filter('translate')('events.types.contest');
			else if( type == 'other' )
				type = $filter('translate')('general.other');

			return type;
		};

		ConverterService.eventTypeToIcon = function(type) 
		{
			if( type == 'show' )
				icon = 'artgallery';
			else if( type == 'contest' )
				icon = 'cup';
			else if( type == 'meeting' )
				icon = 'conference';
			else
				icon = 'smiley_happy';

			return icon;
		};

		return ConverterService;
	})
;