var myApp = angular.module('myApp');

myApp.controller('projectsController', ['orderByFilter','$rootScope', '$state', '$scope', '$http', '$location', '$stateParams','authenFact',
 function (orderBy, $rootScope, $state, $scope, $http, $location, $stateParams,authenFact){
	console.log('projectController loaded');


	$scope.oldProjectID = $stateParams.ProjectID;

	if (!authenFact.getAccessToken())
	{
		$state.go('login');
	}
	else
	{
		console.log("logged in: "+ authenFact.getAccessToken().uid);
		$rootScope.loggedin = true;
	}

	$scope.addProject = true;
	$scope.checkAuthen = function(addProject){

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
				if (!addProject)
				{
					$rootScope.adminloggedin = false;
				}
				else {
					$rootScope.adminloggedin = false;
					$state.go('projects');
					alert("You are not authorized to add projects" + " !");
				}
				
			}

			else
			{
				if (!addProject)
				{
					$rootScope.adminloggedin = true;
				}
				else{
					$rootScope.adminloggedin = true;
					$state.go('addProject');
				}
				
				
			}
		})
		
	}

	$scope.getProjectInfo = function(){
		var id = $stateParams.ProjectID;

		$http.get('/raw/getprojectinfo/' + id)
		.then(function(response){
			$scope.projectInfo = response.data;
			//console.log(response.data);
		})
	}

	$scope.getProjectSubjectInfo = function(){
		var id = $stateParams.ProjectID;

		$http.get('/raw/projectsSubjectInfo/' + id)
		.then(function(response){
			$scope.subjectInfo = response.data;
			//console.log(response.data);
		})
	}

	$scope.findSubject = function(){
		console.log($scope.searchMRN, $scope.searchFN, $scope.searchLN);
		if ($scope.searchMRN == null || $scope.searchMRN == '')
		{
			$scope.searchMRN = 'All';
		}
		if ($scope.searchFN == null || $scope.searchFN == '')
		{
			$scope.searchFN = 'All';
		}
		if ($scope.searchLN == null || $scope.searchLN == '')
		{
			$scope.searchLN = 'All';
		}

		$scope.nomatch =false;
		$scope.qualifiedsubjects = [];
		$http.get('/raw/subjectInfo/' +'All/All/All/All/All/'
		 + $scope.searchMRN +'/' + $scope.searchFN +'/' + $scope.searchLN + '/All')
		.then(function(response){
			console.log(response);
			if(response.data == "no match!" ){
				$scope.nomatch = "No matching subject! Make sure you have entered the correct information.";
				$scope.qualifiedsubjects = [];
			}
			else{
				$scope.qualifiedsubjects = response.data;
			}
			
		});
	}


	$scope.addSubject = function(){
		$scope.project.SubjectsID.push({inProjectID:'', GlobalID:''});
	}

	$scope.removeSubject = function(index){
		$scope.project.SubjectsID.splice(index,1);
	}

	$scope.addlastsubject = function(GID){
		$scope.project.SubjectsID.push({inProjectID:'', GlobalID:GID});
	}

	$scope.removelastsubject = function(){
		$scope.project.SubjectsID.pop();
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
			//console.log(viewList, editList);
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

	$scope.checkViewable = function(projectID){
		var projects = $scope.projects;
		var accessToken = authenFact.getAccessToken().uid;
		for (var i in projects)
		{
			if (projects[i].ProjectID == projectID)
			{
				var authenList = projects[i].AccessAuthen;
				for (var j in authenList)
				{
					if (authenList[j].uid == accessToken || authenList[j].uid == 'AllUsers')
					{
						return true;
					}
				}
			}
		}
		
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
			//console.log(viewList, editList);
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

	$scope.gotosession = true;
	$scope.updateProject = function(gotosession){
		//console.log(gotoscansession);
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
				//console.log("hi" + gotoscansession);
				$http.put('/raw/projects/'+id, $scope.project)
				.then(function(response){
					$scope.noerror = true;
					if (gotosession == false)
					{
						window.location.href= ('/projects/' + $scope.project.ProjectID);
					}
					else
					{
						var projectID = $scope.project.ProjectID;
						var Subjectid =  $scope.project.SubjectsID[($scope.project.SubjectsID.length)-1].inProjectID;
						window.location.href = ( '/ScanInfo/' + projectID + '/' + Subjectid + '/' + Subjectid + '_01/edit');
					}
					
				})
				.catch(function(err){
					if (err.status == 403)
					{
						alert("You are not authorized to edit this project!");
						$state.go('projectDetail', {ProjectID: id});
					}
					if (err.status == 400)
					{
						$scope.error = err.data;
						console.log(err);
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


	$scope.updateProjectandSubject = function(){
		var newsubject = $scope.newsubject;
		var newsubjectGID = $scope.project.SubjectsID[($scope.project.SubjectsID.length)-1].GlobalID;
		var newproject = [{ProjectID: $scope.project.ProjectID, 
			SubjectIDinProject: $scope.project.SubjectsID[($scope.project.SubjectsID.length)-1].inProjectID}];
		newsubject.Projects = newproject;
		newsubject.ID = newsubjectGID;

		$http.post('/raw/subjects', newsubject)
		.then(function(response){
			//window.location.href= ('/projects/' + $scope.project.ProjectID);
			$http.put('/raw/projects/'+$scope.project.ProjectID, $scope.project)
				.then(function(response){

					var projectID = $scope.project.ProjectID;
					var Subjectid =  $scope.project.SubjectsID[($scope.project.SubjectsID.length)-1].inProjectID;
					console.log(projectID, Subjectid);
					window.location.href= ('/ScanInfo/' + projectID + '/' + Subjectid + '/' + Subjectid + '_01/edit');
				})
				.catch(function(err){
					if (err.status == 400)
					{
						$scope.error = err.data;
						console.log(err);
					}
				});
		})
		.catch(function(err){
			$scope.adderror = err.data;
			console.log(err);
		});

		console.log(newsubject);
	}

	$scope.ToChangelog = function(docType){
		//console.log(docType);
		window.open("/changelog/" + docType);
	}

	$scope.ToOneChangelog = function(docID){
		console.log(docID);
		$http.get('/raw/changelog/'+ docID).success(function(response){
			$scope.changelog = response;
			$scope.totalItems = response.length;
		});
	}

	// $scope.openSessionPage = function(project, id){
	// 	if ($scope.noerror)
	// 	{
	// 		var url1 = '/ScanInfo/' + project + '/' + id;
	// 		var url2 = '/ScanInfo/' + project + '/' + id + '/' + id + '_01/edit';
	// 		window.open(url1, 'new_window');
	// 		window.open(url2, 'new_window');
	// 	}
		
	// }

	



	//=============================== Other stuff ================================

	var subjects = $scope.subjectInfo;
   	$scope.propertyName = '_id.SubjectsID';
  	$scope.reverse = false;
  	$scope.subjectInfo = orderBy(subjects, $scope.propertyName, $scope.reverse);

  	$scope.sortBy = function(propertyName) {
  		//console.log(propertyName, $scope.subjectInfo);
	    $scope.reverse = (propertyName !== null && $scope.propertyName === propertyName)
	        ? !$scope.reverse : false;
	    $scope.propertyName = propertyName;
	    $scope.subjectInfo = orderBy($scope.subjectInfo, $scope.propertyName, $scope.reverse);
	};


}]);



myApp.controller('addProjectController', ['$rootScope','$state', '$scope', '$http', '$location', '$stateParams', 'authenFact',
	function ($rootScope, $state, $scope, $http, $location, $stateParams, authenFact){
	console.log('addProjectController loaded');

	

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
					}
				}

				//console.log(adminTypes, subjectID, addSubject);

				if (!adminTypes.includes(uid))
				{
					$state.go('projects');
					alert("You are not authorized to add projects" + " !");
					$rootScope.adminloggedin = false;
				}

				else
				{
					$state.go('addProject');
					$rootScope.adminloggedin = true;
				}
			})
			
		}

		$scope.project = {
				ProjectID:'',
				ProjectName: '',
				ProjectDesc:'',
				Other:'',
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
			.catch(function(err){
				if (err.status == 400)
				{
					$scope.error = err.data;
					console.log(err);
				}
			});
		}
	}

}]);


