var myApp = angular.module('myApp');

myApp.controller('projectsController', ['$state', '$scope', '$http', '$location', '$stateParams','authenFact',
 function ($state, $scope, $http, $location, $stateParams,authenFact){
	console.log('projectController loaded');

	console.log("logged in: "+ authenFact.getAccessToken());

	if (!authenFact.getAccessToken())
	{
		$state.go('login');
	}


	$scope.addSubject = function(){
		$scope.project.SubjectsID.push({inProjectID:'', GlobalID:''});
	}

	$scope.removeSubject = function(index){
		$scope.project.SubjectsID.splice(index,1);
	}	


	$scope.getProjects = function(){
		$http.get('/raw/projects').success(function(response){
			$scope.projects = response;
		});
	}

	$scope.getProject = function(){
		var id = $stateParams.ProjectID;
		$http.get('/raw/projects/'+id).success(function(response){
			$scope.project = response;
		});
	}


	$scope.addProject = function(){
		console.log($scope.project);
		console.log('add project');	
		$scope.project = {
			ProjectID:'',
			ProjectName: '',
			SubjectsID: [{inProjectID:'', GlobalID: ''}]
		};
		$http.post('/raw/projects', $scope.project).success(function(response){
			window.location.href= '/projects';
		});
	}

	$scope.updateProject = function(){
		var id = $stateParams.ProjectID;
		//$scope.project.SubjectsID = [];
		$http.put('/raw/projects/'+id, $scope.project).success(function(response){
			window.location.href= ('/projects/' + id);
		});
	}

	$scope.removeProject = function(ProjectID){
		$http.delete('/raw/projects/'+ProjectID).success(function(response){
			window.location.href= '/projects';
		});
	}
	

}]);



myApp.controller('addProjectController', ['$state', '$scope', '$http', '$location', '$stateParams', 'authenFact',
	function ($state, $scope, $http, $location, $stateParams, authenFact){
	console.log('addProjectController loaded');

	console.log("logged in: "+ authenFact.getAccessToken());

	if (!authenFact.getAccessToken())
	{
		$state.go('login');
	}

	$scope.project = {
			ProjectID:'',
			ProjectName: '',
			SubjectsID: []
		};

	$scope.addSubject = function(){
		$scope.project.SubjectsID.push({inProjectID:'', GlobalID:''});
	}

	$scope.removeSubject = function(index){
		$scope.project.SubjectsID.splice(index,1);
	}	

	$scope.addProject = function(){
		console.log($scope.project);
		console.log('add project');	

		$http.post('/raw/projects', $scope.project).success(function(response){
			window.location.href= '/projects';
		});
	}

}]);


