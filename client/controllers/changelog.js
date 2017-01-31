var myApp = angular.module('myApp');

myApp.controller('changelogController', ['orderByFilter','$rootScope','$state', '$scope', '$http', '$location', '$stateParams','authenFact',
 function (orderBy, $rootScope, $state, $scope, $http, $location, $stateParams, authenFact){
	console.log('changelogController loaded');

	if (!authenFact.getAccessToken())
	{
		$state.go('login');
	}
	else
	{
		console.log("logged in: "+ authenFact.getAccessToken().uid);
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

				//console.log(adminTypes);
				if (!adminTypes.includes(uid))
				{
					$state.go('home');
					alert("You are not authorized to view this page" + " !");
				}
			})
			
		}


		$scope.getChangelog = function(){
			var docType = $stateParams.doctype;
			$scope.docType = docType;
			$http.get('/raw/changelogdoctype/'+ docType).success(function(response){
				$scope.allchangelog = response;
			});
		}

		$scope.getScanChangelog = function(){
			$scope.docID = $stateParams.docID;
			$http.get('/raw/changelogs/ScanSessions/'+ $scope.docID).success(function(response){
				console.log(response);
				$scope.allchangelog = response;
			});
		}

		$scope.removeRecord = function(change){
			console.log(change);
			var changeID = change._id;

			$http.delete('/raw/changelog/'+ changeID)
				.success(function(response){
					window.location.href= '/changelog/'+ change.DocumentType ;
				});
			
		}

		//================================= Pagination ===============================

		$scope.maxSize = 5; //number of page buttons
		$scope.currentPage = 1;
		$scope.viewby = 3;
		$scope.itemsPerPage = $scope.viewby;

		$scope.setItemsPerPage = function(num) {
		  $scope.itemsPerPage = num;
		  $scope.currentPage = 1; //reset to first page
		}



	//=============================== Other stuff ================================

	var changelogs = $scope.allchangelog;
   	$scope.propertyName = 'Date';
  	$scope.reverse = false;
  	$scope.allchangelog = orderBy(changelogs, $scope.propertyName, $scope.reverse);

  	$scope.sortBy = function(propertyName) {
	    $scope.reverse = (propertyName !== null && $scope.propertyName === propertyName)
	        ? !$scope.reverse : false;
	    $scope.propertyName = propertyName;
	    $scope.allchangelog = orderBy($scope.allchangelog, $scope.propertyName, $scope.reverse);
	};




	}


	

}]);
