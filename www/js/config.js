var version = '0.8-alpha';
var versionCodename = 'alaskan-malamute';
var timeLastUpdated = '2015-04-05 20:00';

var stage = 'development';

var baseUrl = 'http://psicek.si';

var apiUrl = baseUrl + '/api';

var defaultLocale = 'sl_SI';

var isTesting = false;

var locales = {
	'sl_SI' : 'languages.slovenian',
	'de_DE' : 'languages.german',
	'en_US' : 'languages.english',
};

var currentLocale = defaultLocale;

var androidPushNotificationId = 211853644861;

var admobUnits = {
    ios : {
        banner: 'ca-app-pub-9431452149351649/6394312540',
        interstitial: 'ca-app-pub-9431452149351649/7871045746'
    },
    android : {
        banner: 'ca-app-pub-9431452149351649/4169202949',
        interstitial: 'ca-app-pub-9431452149351649/3440846144',
    }
};

var admobid = ( /(android)/i.test(navigator.userAgent) )
    ? admobUnits.android
    : admobUnits.ios
;

/* If we're on a mobile device... */
function isDevice()
{
	return window.location.protocol === "file:";
}

function historyGoBack()
{
    try {
        //navigator.app.backHistory();
        window.history.go(-1);
    }
    catch(err) {
        console.log(err);
        window.history.back();
    }
}

function hasHistory()
{
    return typeof (navigator.app) !== "undefined" || window.history;
}
