var myApp = angular.module('myApp');

myApp.controller('subjectsController', ['$filter','$state', '$scope', '$http', '$location', '$stateParams', 'authenFact',
	function ($filter, $state, $scope, $http, $location, $stateParams, authenFact){
	console.log('SubjectsController loaded');

	console.log("logged in: "+ authenFact.getAccessToken());

	if (!authenFact.getAccessToken())
	{
		$state.go('login');
	}

	$scope.checkAuthen = function(){
		if (authenFact.getAccessToken().uid != 'shawnawei')
		{
			$state.go('subjects');
			alert("You are not authorized to edit this subject!");
		}
	}


	$scope.getAuthenViewList = function(projectID, subjectIDinProject){

		var viewList = [];
		var editList = [];

		$http.get('/raw/ScanSession/'+projectID + '/'+ subjectIDinProject)
		.then(function(response){
			if (response.data != null)
			{
				var accessList = response.data.AccessAuthen;
				for (var num in accessList)
				{
					if(accessList[num].ViewOnly == false)
					{
						editList.push(accessList[num].uid);
						viewList.push(accessList[num].uid);
					}
					else
					{
						viewList.push(accessList[num].uid);
					}
				}
			}
			console.log(viewList, editList);
			$scope.viewList = viewList;
			$scope.editList = editList;
			var accessToken = authenFact.getAccessToken().uid;

			if ($scope.viewList == [])
			{
				$state.go('subjectDetail', {ID:$stateParams.ID});
				alert("You are not authorized to view this scan session!");
			}

			else if (!$scope.viewList.includes(accessToken) && !$scope.viewList.includes('AllUsers'))
			{
				$state.go('subjectDetail', {ID: $stateParams.ID});
				alert("You are not authorized to view this scan session!");
			}

			else {
				$state.go('scanDetails', {ProjectID: projectID, SubjectIDinProject: subjectIDinProject});
			}

		});

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
	console.log(authenFact.getAccessToken());
	

	if (!authenFact.getAccessToken())
	{
		$state.go('login');
	}

	else if (authenFact.getAccessToken().uid != 'shawnawei')
	{
		$state.go('subjects');
		alert("You are not authorized to add new subjects!");
	}

	else
	{
		console.log("logged in: "+ authenFact.getAccessToken().uid);
	}

	$scope.subject = {
			ID:'',
			Sex: '',
			FirstName:'',
			LastName:'',
			Handedness:'',
			Diagnosis: '',
			DateOfBirth:'',
			MRN:null,
			ContactPermit:false,
			ContactInfo:'',
			Other:'',
			AccessAuthen:[{uid:'shawnawei', ViewOnly: false}],
			Projects: []
		};

	$scope.addProject = function(){
		$scope.subject.Projects.push({ProjectID:'', SubjectIDinProject: ''});
	}

	$scope.removeProject = function(index){
		$scope.subject.Projects.splice(index,1);
	}

	$scope.addUser = function(){
		$scope.subject.AccessAuthen.push({uid:'', ViewOnly:false});
	}

	$scope.removeUser = function(index){
		$scope.subject.AccessAuthen.splice(index,1);
	}		
	
	$scope.addSubject = function(){
		console.log($scope.subject);
		console.log('add subject');
		$http.post('/raw/subjects', $scope.subject)
		.then(function(response){
			console.log(response);
			window.location.href = '/subjects';
		})
		.catch(function(err){
			console.log(err);
		});
	}

}]);


