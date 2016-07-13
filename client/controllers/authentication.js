var myApp = angular.module('myApp');

myApp.controller('authenController', [ '$scope', '$http', '$location','localStorageService', 'authenFact',
 function ($scope, $http, $location, localStorageService, authenFact){
	console.log('authenController loaded');

	$scope.HomeLogin = function(User){

		authenFact.setAccessToken(false);

		$http.post('/raw/login', User)
		.success(function(response){
			authenFact.setAccessToken(response);
			$location.path('/home');
		})
		.error(function(response){
			if (response == 'Bad Request')
			{
				$scope.error = "Please enter your username and password!";
			}

			if (response == 'Unauthorized')
			{
				$scope.error = "Incorrect username or password!";
			}
			authenFact.setAccessToken(false);
			
		});
	}

}]);


myApp.controller('homeController', [ '$state','$scope', '$http', '$location', 'localStorageService', 'authenFact',
	function($state, $scope, $http, $location, localStorageService, authenFact){
	console.log('homeController loaded');

	console.log(authenFact.getAccessToken());
	

	if (!authenFact.getAccessToken())
	{
		$state.go('login');
	}

	else
	{

		$scope.getSubjects = function(){
		$http.get('/raw/subjects').success(function(response){
			$scope.subjects = response;
		});
	}

	$scope.getProjects = function(){
		$http.get('/raw/projects').success(function(response){
			$scope.projects = response;
		});
	}

	$scope.getScanSessions = function(){
		$http.get('/raw/scanSessions').success(function(response){
			var oldarray = [];
			response.map(function(a){
				var session = a.ScanSessions;
				for (var num in session)
				{
					oldarray.push(session[num].SessionID);
				}
			});
			$scope.scan = oldarray;
		});
	}

	$scope.getNumbers = function(){
		$scope.subjects=getSubjects();
		$scope.projects=getProjects();
		$scope.scanSessions= getScanSessions();
	}



	$scope.HomeLogin = function(User){
		$http.post('/raw/login', User)
		.success(function(response){
			window.location.href= '/subjects';
		})
		.error(function(response){
			if (response == 'Bad Request')
			{
				$scope.error = "Please enter your username and password!";
			}

			if (response == 'Unauthorized')
			{
				$scope.error = "Incorrect username or password!";
			}
			
		});
	}

	$scope.logOut = function(){
		console.log("bye " + authenFact.getAccessToken().displayName);

		if(authenFact.getAccessToken())
		{
			authenFact.removeAccessToken();
			console.log(authenFact);
			$http.get('/raw/logOut').success(function(){});
			$state.go('login');
			
		}
		
	}
		
	}




}]);