var myApp = angular.module('myApp');

myApp.controller('adminController', ['$rootScope','$state', '$scope', '$http', '$location', '$stateParams','authenFact',
 function ($rootScope, $state, $scope, $http, $location, $stateParams, authenFact){
	console.log('adminController loaded');

	

	if (!authenFact.getAccessToken())
	{
		$state.go('login');
	}
	else
	{
		console.log("logged in: "+ authenFact.getAccessToken());
		$rootScope.loggedin = true;

		$scope.checkAuthen = function(){

			$http.get('raw/Users')
			.then(function(response){
				var Users = response.data;
				var uid = authenFact.getAccessToken().uid;
				var adminTypes = [];
				for (var num in Users)
				{
					if (Users[num].Type == 'admin')
					{
						adminTypes.push(Users[num].uid);
						$rootScope.adminloggedin = true;
					}
				}

				console.log(adminTypes);
				if (!adminTypes.includes(uid))
				{
					$state.go('home');
					alert("You are not authorized to view this page" + " !");
				}
			})
			
		}
		

		$scope.getTestTypes = function(){
			$http.get('raw/testTypes').success(function(response){
				$scope.testTypes = response;
			});
		}

		$scope.getTestType = function(type){
			$http.get('raw/testTypes/'+type).success(function(response){
				$scope.OneTestType = response;
			});
		}

		$scope.editTestTypes = function(test){
			$scope.oldtest = "test";
			$http.put('raw/testTypes/' + test.TestID, test).success(function(response){
				window.location.href= '/admin/edit_test_types';
			});
		}

		$scope.addTestType = function(newTestType){
			$http.post('raw/testTypes', newTestType).success(function(response){
				window.location.href= '/admin/edit_test_types';
			});
		}

		$scope.removeTestType = function(type){
			$http.delete('raw/testTypes/'+type.TestID).success(function(response){
				window.location.href= '/admin/edit_test_types';
			});
		}



		$scope.getMEGTypes = function(){
			$http.get('/raw/MEGTypes').success(function(response){
				$scope.MEGTypes = response;
			});
		}

		$scope.getMEGType = function(type){
			$http.get('/raw/MEGTypes/'+type).success(function(response){
				$scope.OneMEGType = response;
			});
		}

		$scope.editMEGTypes = function(type){
			$scope.oldtest = "hi";
			$http.put('/raw/MEGType/' + type.TypeID, type).success(function(response){
				window.location.href= '/admin/edit_test_types';
			});
		}

		$scope.addMEGType = function(newMEGType){
			$http.post('/raw/MEGTypes', newMEGType).success(function(response){
				window.location.href= '/admin/edit_test_types';
			});
		}

		$scope.removeMEGType = function(type){
			$http.delete('/raw/MEGTypes/'+ type.TypeID).success(function(response){
				window.location.href= '/admin/edit_test_types';
			});
		}




		$scope.getMRITypes = function(){
			$http.get('/raw/MRITypes').success(function(response){
				$scope.MRITypes = response;
			});
		}

		$scope.getMRIType = function(type){
			$http.get('/raw/MRITypes/'+type).success(function(response){
				$scope.OneMRIType = response;
			});
		}

		$scope.editMRITypes = function(type){
			$scope.oldtest = "hi";
			$http.put('/raw/MRIType/' + type.TypeID, type).success(function(response){
				window.location.href= '/admin/edit_test_types';
			});
		}

		$scope.addMRIType = function(newMRIType){
			$http.post('/raw/MRITypes', newMRIType).success(function(response){
				window.location.href= '/admin/edit_test_types';
			});
		}

		$scope.removeMRIType = function(type){
			$http.delete('/raw/MRITypes/'+ type.TypeID).success(function(response){
				window.location.href= '/admin/edit_test_types';
			});
		}



		//============================== manage users ==============================

		$scope.getUsers = function(){
			$http.get('/raw/Users')
			.then(function(response){
				$scope.Users = response.data;
			})
		}

		$scope.userProjectAuthen = [];

		$scope.getAuthenProjects = function(_uid){
			$http.get('/raw/projects')
			.then(function(response){
				var allprojects = response.data;
				var authenProjects = []; //project list this user has access to
				for (var num in allprojects)
				{
					var authenUIDs = [];
					var projectauthenlist = allprojects[num].AccessAuthen;

					function finduid(project) { 
					    return project.uid === _uid;
					}

					if (projectauthenlist.find(finduid)!= undefined)
					{
						authenProjects.push({
							ProjectID: allprojects[num].ProjectID, 
							ViewOnly:projectauthenlist.find(finduid).ViewOnly 
						})
					}

				}
				console.log(authenProjects);

				$scope.userProjectAuthen.push(authenProjects);
			})
		}

		$scope.getUser = function(uid){
			$http.get('/raw/Users/'+uid).success(function(response){
				$scope.OneUser = response;
			});
		}

		$scope.editUser = function(user){
			$http.put('/raw/Users/' + user.uid, user).success(function(response){
				window.location.href= '/admin/manage_user';
			});
		}

		$scope.addUser = function(newUser){
			$http.post('/raw/Users', newUser).success(function(response){
				window.location.href= '/admin/manage_user';
			});
		}

		$scope.removeUser = function(user){
			$http.delete('/raw/Users/'+ user.uid).success(function(response){
				window.location.href= '/admin/manage_user';
			});
		}
	}



}]);

// //============================ for convert excel to json ====================

// 	var oFileIn;
// 	$(function() {
// 	    oFileIn = document.getElementById('rawFile');
// 	    if(oFileIn.addEventListener) {
// 	        oFileIn.addEventListener('change', filePicked, false);
// 	    }
// 	});


// 	function filePicked(oEvent) {
// 	    // Get The File From The Input
// 	    var oFile = oEvent.target.files[0];
// 	    var sFilename = oFile.name;
// 	    // Create A File Reader HTML5
// 	    var reader = new FileReader();

// 	    // Ready The Event For When A File Gets Selected
// 	    reader.onload = function(e) {
// 	        var data = e.target.result;
// 	        console.log(data);
	       
// 	    };

// 	    reader.readAsBinaryString(oFile); 
// 	    if(data != undefined)
// 	    {
// 	    	 $http.post('/raw/exportToJson/', data).success(function(response){
// 			});
// 	    }
	   
// 	}



