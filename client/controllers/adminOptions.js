var myApp = angular.module('myApp');

myApp.controller('adminController', ['$state', '$scope', '$http', '$location', '$stateParams','authenFact',
 function ($state, $scope, $http, $location, $stateParams, authenFact){
	console.log('adminController loaded');

	console.log("logged in: "+ authenFact.getAccessToken());

	if (!authenFact.getAccessToken())
	{
		$state.go('login');
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

}]);

