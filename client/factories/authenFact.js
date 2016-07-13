myApp.factory('authenFact', ['localStorageService', function(localStorageService){
	var authenFact = {};

	authenFact.setAccessToken = function(accessToken){
		localStorageService.cookie.set('accessToken', accessToken);
		authenFact.authenToken = accessToken;
	};

	authenFact.getAccessToken = function(){
		authenFact.authenToken = localStorageService.cookie.get('accessToken');
		return authenFact.authenToken;
	};

	authenFact.removeAccessToken = function(){
		authenFact.authenToken = localStorageService.cookie.remove('accessToken');
	}

	return authenFact;
}])

myApp.factory('oneTimeAuthen', [function(){
	var oneTimeAuthen = {};

	oneTimeAuthen.setAccessToken = function(accessToken){
		oneTimeAuthen.authenToken = accessToken;
	};

	oneTimeAuthen.getAccessToken = function(){
		return oneTimeAuthen.authenToken;
	};

	return oneTimeAuthen;
}])