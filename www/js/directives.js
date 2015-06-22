angular
	.module('application')

	.directive('imgOriginal', function() {
	  return {
	    restrict: 'A',
	    scope: { imgOriginal: '@' },
	    link: function(scope, element, attrs) {
	      initialLoad = false
	      
	      element.bind('load', function() {
	        initialLoad = true;
	        if(!scope.imgOriginal) return;
	        element.attr('src', scope.imgOriginal);
	      });

	      attrs.$observe('imgOriginal', function(value) {
	        if(!value) return;
	        if(initialLoad) element.attr('src', value);
	      });
	    }
	  };
	})

;