var myApp = angular.module('myApp');

myApp.controller('authenController', ['$rootScope','$state', '$scope', '$http', '$location','localStorageService', 'authenFact',
 function ($rootScope,$state, $scope, $http, $location, localStorageService, authenFact){

	console.log('authenController loaded');

	if (!authenFact.getAccessToken())
	{
		$rootScope.adminloggedin = false;
		$rootScope.loggedin = false;

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

	}

	else
	{	
		$state.go('home');
	}

	
}]);


myApp.controller('homeController', ['$rootScope', '$state','$scope', '$http', '$location', 'localStorageService', 'authenFact', 'Idle',
	function($rootScope, $state, $scope, $http, $location, localStorageService, authenFact, Idle){
	console.log('homeController loaded');

	//start timing, this is for everytime user re-login
	Idle.watch();


	if (!authenFact.getAccessToken())
	{
		$state.go('login');
	}

	else
	{
		console.log("logged in as: "+ authenFact.getAccessToken().uid);
		$rootScope.loggedin = true;
		$rootScope.timer = 0;


		$scope.checkAuthen = function(){

			$http.get('raw/Users')
			.then(function(response){
				var Users = response.data;
				//console.log(authenFact.getAccessToken());
				var _uid = authenFact.getAccessToken().uid;
				var userdisplayname = authenFact.getAccessToken().displayName;
				var usertitle = authenFact.getAccessToken().title;

				var user = {
					uid:_uid, 
					displayName:userdisplayname, 
					type: '', 
					projects:[], 
					title:usertitle
				};

				for(var num in Users)
				{
					if (Users[num].uid == _uid)
					{
						user.type = Users[num].Type;
					}
				}

				if (user.type != 'admin')
				{
					$rootScope.adminloggedin = false;
				}

				else
				{
					$rootScope.adminloggedin = true;
				}

				$scope.user = user;
			})
		}

		$scope.gotoproject = function(project){

			$state.go('projectDetail', {ProjectID: project});
		}


		$scope.getSubjects = function(){
		$http.get('/raw/subjectnum').success(function(response){
			$scope.subjectlength = response;
		});
		}

		$scope.getProjects = function(){
			$http.get('/raw/projectnum').success(function(response){
				$scope.projectlength = response;
			});
		}

		$scope.getAuthenProjects = function(){
			$http.get('/raw/projects-authen').success(function(response){
				
				var authenProjects = [];
				for (var num in response)
				{
					var id = response[num].ProjectID;
					var name = response[num].ProjectName;
					var authenList = response[num].AccessAuthen;
					var _uid = authenFact.getAccessToken().uid;

					for (var i in authenList)
					{
						if (authenList[i].uid == _uid && authenList[i].ViewOnly == true)
						{
							var accesslevel = 'View Only';
						}
						else if (authenList[i].uid == _uid && authenList[i].ViewOnly == false)
						{
							var accesslevel = 'Editable';
						}
						else if (authenList[i].uid == 'AllUsers' && authenList[i].ViewOnly == false)
						{
							var accesslevel = 'Editable';
						}
					}
					

					authenProjects.push({ProjectID: id, ProjectName: name, AccessAuthen: accesslevel});
				}

				$scope.AuthenProjects = authenProjects;
			});
		}

		$scope.getScanSessions = function(){
			$http.get('/raw/scannum').success(function(response){
				$scope.scanlength = response;
			});
		}



		// $scope.HomeLogin = function(User){
		// 	$http.post('/raw/login', User)
		// 	.success(function(response){
		// 		window.location.href= '/subjects';
		// 	})
		// 	.error(function(response){
		// 		if (response == 'Bad Request')
		// 		{
		// 			$scope.error = "Please enter your username and password!";
		// 		}

		// 		if (response == 'Unauthorized')
		// 		{
		// 			$scope.error = "Incorrect username or password!";
		// 		}
				
		// 	});
		// }

		$scope.logOut = function(){
			console.log("bye " + authenFact.getAccessToken().displayName);

			if(authenFact.getAccessToken())
			{
				authenFact.removeAccessToken();
				$http.get('/raw/logOut').success(function(){});
				$state.go('login');
			}
			
		}	
	}

}]);