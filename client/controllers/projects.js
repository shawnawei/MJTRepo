var myApp = angular.module('myApp');

myApp.controller('projectsController', ['$state', '$scope', '$http', '$location', '$stateParams','authenFact',
 function ($state, $scope, $http, $location, $stateParams,authenFact){
	console.log('projectController loaded');

	console.log("logged in: "+ authenFact.getAccessToken());
	$scope.oldProjectID = $stateParams.ProjectID;

	if (!authenFact.getAccessToken())
	{
		$state.go('login');
	}

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
				}
			}

			//console.log(adminTypes, subjectID, addSubject);

			if (!adminTypes.includes(uid))
			{
				$state.go('projects');
				alert("You are not authorized to add projects" + " !");
			}

			else
			{
				$state.go('addProject');
			}
		})
		
	}


	$scope.addSubject = function(){
		$scope.project.SubjectsID.push({inProjectID:'', GlobalID:''});
	}

	$scope.removeSubject = function(index){
		$scope.project.SubjectsID.splice(index,1);
	}

	$scope.addUser = function(){
		$scope.project.AccessAuthen.push({uid:'', ViewOnly:false});
	}

	$scope.removeUser = function(index){
		$scope.project.AccessAuthen.splice(index,1);
	}	


	$scope.getProjects = function(){
		$http.get('/raw/projects').success(function(response){
			$scope.projects = response;
		});
	}

	$scope.getProject = function(){
		var id = $stateParams.ProjectID;
		$http.get('/raw/projects/'+id)
		.then(function(response){
			if (response.data == null)
			{
				$state.go('projects');
				alert("You are not authorized to view or edit this project!");
			}
			else
			{
				$scope.project = response.data;
			}
			
		});
	}


	$scope.getAuthenList = function(projectID){
		var viewList = [];
		var editList = [];

		$http.get('/raw/projects/'+projectID)
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

			if ($scope.editList == [])
			{
				$scope.editable = false;
			}

			else if (!$scope.editList.includes(accessToken) && !$scope.editList.includes('AllUsers'))
			{
				$scope.editable = false;
			}

			else {
				$scope.editable = true;
			}

		});

	}


	$scope.getAuthenViewList = function(projectID){
		var viewList = [];
		var editList = [];

		$http.get('/raw/projects/'+projectID)
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
				$state.go('projects');
				alert("You are not authorized to view this project!");
			}

			else if (!$scope.viewList.includes(accessToken) && !$scope.viewList.includes('AllUsers'))
			{
				$state.go('projects');
				alert("You are not authorized to view this project!");
			}

			else {
				$state.go('projectDetail', {ProjectID: projectID});
			}

		});

	}

	$scope.getAuthenEditList = function(projectID){
		var viewList = [];
		var editList = [];

		$http.get('/raw/projects/'+projectID)
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

			if ($scope.editList == [])
			{
				$state.go('projectDetail', {ProjectID:projectID});
				alert("You are not authorized to edit this project!");
			}

			else if (!$scope.editList.includes(accessToken) && !$scope.editList.includes('AllUsers'))
			{
				$state.go('projectDetail', {ProjectID:projectID});
				alert("You are not authorized to edit this project!");
			}

			else {
				$state.go('editProject', {ProjectID: projectID});
			}

		});

	}

	$scope.updateProject = function(){
		var projectID = $stateParams.ProjectID;
		var viewList = [];
		var editList = [];

		$http.get('/raw/projects/'+projectID)
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
			if (!$scope.editList.includes(accessToken) && !$scope.editList.includes('AllUsers'))
			{
				$state.go('projectDetail', {ProjectID: projectID});
				alert("You are not authorized to edit this project!");
			}

			else
			{
				var id = $stateParams.ProjectID;
				$http.put('/raw/projects/'+id, $scope.project)
				.then(function(response){
					console.log("hi" + response);
					window.location.href= ('/projects/' + id);
				})
				.catch(function(err){
					if (err.status == 403)
					{
						alert("You are not authorized to edit this project!");
						$state.go('projectDetail', {ProjectID: id});
					}
				});
			}
		});
	}

	$scope.removeProject = function(projectID){

		var viewList = [];
		var editList = [];

		$http.get('/raw/projects/'+projectID)
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


			if ($scope.editList == [])
			{
				$state.go('projectDetail', {ProjectID:projectID});
				alert("You are not authorized to delete this project!");
			}

			else if (!$scope.editList.includes(accessToken) && !$scope.editList.includes('AllUsers'))
			{
				$state.go('projectDetail', {ProjectID:projectID});
				alert("You are not authorized to delete this project!");
			}

			else
			{
				$http.delete('/raw/projects/'+projectID)
				.then(function(response){
					window.location.href= '/projects';
				})
				.catch(function(err){
					console.log(err);
					alert("You are not authorized to delete this project!");
				});
			}
		
		});
	}
	

}]);



myApp.controller('addProjectController', ['$state', '$scope', '$http', '$location', '$stateParams', 'authenFact',
	function ($state, $scope, $http, $location, $stateParams, authenFact){
	console.log('addProjectController loaded');

	

	if (!authenFact.getAccessToken())
	{
		$state.go('login');
	}
	else 
	{
		console.log("logged in: "+ authenFact.getAccessToken().uid);
	}

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
				}
			}

			//console.log(adminTypes, subjectID, addSubject);

			if (!adminTypes.includes(uid))
			{
				$state.go('projects');
				alert("You are not authorized to add projects" + " !");
			}

			else
			{
				$state.go('addProject');
			}
		})
		
	}

	$scope.project = {
			ProjectID:'',
			ProjectName: '',
			SubjectsID: [],
			AccessAuthen: [{uid:'shawnawei', ViewOnly: false}]
		};

	$scope.addSubject = function(){
		$scope.project.SubjectsID.push({inProjectID:'', GlobalID:''});
	}

	$scope.removeSubject = function(index){
		$scope.project.SubjectsID.splice(index,1);
	}	

	$scope.addUser = function(){
		$scope.project.AccessAuthen.push({uid:'', ViewOnly:false});
	}

	$scope.removeUser = function(index){
		$scope.project.AccessAuthen.splice(index,1);
	}	

	$scope.addProject = function(){
		console.log($scope.project);
		console.log('add project');	

		$http.post('/raw/projects', $scope.project)
		.then(function(response){
			window.location.href= '/projects';
		})
		.catch(function(response){
			console.log(response);
		});
	}

}]);


