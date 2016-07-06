var myApp = angular.module('myApp');

myApp.controller('subjectsController', ['$state', '$scope', '$http', '$location', '$stateParams', 'authenFact',
	function ($state, $scope, $http, $location, $stateParams, authenFact){
	console.log('SubjectsController loaded');

	console.log("logged in: "+ authenFact.getAccessToken());

	if (!authenFact.getAccessToken())
	{
		$state.go('login');
	}
	
	$scope.getSubjects = function(){
		$scope.hi = "what";
		$http.get('/raw/subjects').success(function(response){
			$scope.subjects = response;
		});
	}

	$scope.getSubject = function(){
		var id = $stateParams.ID;

		$http.get('/raw/subjects/'+id).success(function(response){
			$scope.subject = response;
		});
	}

	$scope.addSubject = function(){
		console.log("logged in: "+ authenFact.authenToken);

		console.log($scope.subject);
		console.log('add subject');
		$http.post('/raw/subjects', $scope.subject).success(function(response){
			window.location.href= '/subjects';
		});
	}

	$scope.updateProject = function(){
		var id = $stateParams.ProjectID;
		$http.put('/raw/projects/'+id, $scope.project).success(function(response){
			window.location.href= '/projects';
		});
	}


	$scope.updateSubject = function(){
		var id = $stateParams.ID;
		$http.put('/raw/subjects/'+id, $scope.subject).success(function(response){
			window.location.href= '/subjects/' + id;
		});
	}

	$scope.removeSubject = function(ID){
		$http.delete('/raw/subjects/'+ID).success(function(response){
			window.location.href= '/subjects';
		});
	}

	$scope.addProject = function(){
		$scope.subject.Projects.push({ProjectID:'', SubjectIDinProject: ''});
	}

	$scope.removeProject = function(index){
		$scope.subject.Projects.splice(index,1);
	}


}]);

myApp.controller('addSubjectController', ['$state', '$scope', '$http', '$location', '$stateParams', 'authenFact',
	function ($state, $scope, $http, $location, $stateParams, authenFact){
	console.log('addSubjectController loaded');

	console.log("logged in: "+ authenFact.getAccessToken());

	if (!authenFact.getAccessToken())
	{
		$state.go('login');
	}

	$scope.subject = {
			ID:'',
			Sex: '',
			Handedness:'',
			Diagnosis: '',
			DateOfBirth:'',
			MRN:null,
			ContactPermit:false,
			Other:'',
			Projects: []
		};

	$scope.addProject = function(){
		$scope.subject.Projects.push({ProjectID:'', SubjectIDinProject: ''});
	}

	$scope.removeProject = function(index){
		$scope.subject.Projects.splice(index,1);
	}	
	
	$scope.addSubject = function(){
		console.log($scope.subject);
		console.log('add subject');
		$http.post('/raw/subjects', $scope.subject).success(function(response){
			window.location.href = '/subjects';
		});
	}

}]);


