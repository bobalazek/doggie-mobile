angular
	.module('application')

	.filter('htmlToPlaintext', function() {
		return function(text) {
			return String(text).replace(/<(?!br\s*\/?)[^>]+>/g, '');
		}
	})

	.filter('keys', function () {
		return function (object) {
			return Object.keys(object || {}).filter(function (key) {
				return key !== '$$hashKey'; // this is from ng-repeat
			});
		};
	})
;