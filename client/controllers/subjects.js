var myApp = angular.module('myApp');

myApp.controller('subjectsController', ['orderByFilter', '$rootScope','$state', '$scope', '$http', '$location', '$stateParams', 'authenFact',
	function (orderBy, $rootScope, $state, $scope, $http, $location, $stateParams, authenFact){
	console.log('SubjectsController loaded');

	

	if (!authenFact.getAccessToken())
	{
		$state.go('login');
	}
	else
	{
		console.log("logged in: "+ authenFact.getAccessToken().uid);
		$rootScope.loggedin = true;
	}

	

	$scope.subjectID = 'empty';
	$scope.newSubject = true;
	$scope.oldSubjectID = $stateParams.ID;
	$scope.checkAuthen = function(subjectID, addSubject){

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
				$state.go('subjects');
				alert("You are not authorized" + " !");
				$rootScope.adminloggedin = false;
			}

			else
			{
				if (addSubject == undefined)
				{
					$state.go('subjectDetail', {ID:subjectID});
					$rootScope.adminloggedin = true;
				}
				else if (subjectID == 'empty' && addSubject == true)
				{
					$state.go('addSubject');
					$rootScope.adminloggedin = true;
				}
				else if (subjectID == 'empty' && addSubject == false)
				{
					$rootScope.adminloggedin = true;
				}
				else if (addSubject == false)
				{
					$state.go('editSubject',{ID:subjectID});
					$rootScope.adminloggedin = true;
				}
				
			}
		})
		
	}

	$scope.onsubjects = true;
	$scope.getAuthenViewList = function(projectID, subjectIDinProject, onsubjects){

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
				if(onsubjects)
				{
					$state.go('subjects');
				}
				else
				{
					$state.go('subjectDetail', {ID:$stateParams.ID});
				}
				
				alert("You are not authorized to view this scan session!");
			}

			else if (!$scope.viewList.includes(accessToken) && !$scope.viewList.includes('AllUsers'))
			{
				
				if(onsubjects)
				{
					$state.go('subjects');
				}
				else
				{
					$state.go('subjectDetail', {ID:$stateParams.ID});
				}
				alert("You are not authorized to view this scan session!");
			}

			else {
				$state.go('scanDetails', {ProjectID: projectID, SubjectIDinProject: subjectIDinProject});
			}

		});

	}

	$scope.getAuthenProjectList = function(){
		var uid = authenFact.getAccessToken().uid;
		$http.get('/raw/projects-authen').success(function(response){
				
			var authenProjects = [];
			for (var num in response)
			{
				var id = response[num].ProjectID;
				var authenList = response[num].AccessAuthen;
				var _uid = authenFact.getAccessToken().uid;

				for (var i in authenList)
				{
					if (authenList[i].uid == _uid && authenList[i].ViewOnly == false)
					{
						authenProjects.push({ProjectID: id, ProjectName: name});
					}
					else if (authenList[i].uid == 'AllUsers' && authenList[i].ViewOnly == false)
					{
						authenProjects.push({ProjectID: id, ProjectName: name});
					}
				}
			}

			$scope.AuthenProjects = authenProjects;
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
		console.log($scope.subject);
		$http.put('/raw/subjects/'+id, $scope.subject)
		.then(function(response){
			window.location.href= '/subjects/' + $scope.subject.ID;
		})
		.catch(function(err){
			$scope.error = err.data;
			console.log(err);
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

	$scope.addUser = function(){
		$scope.subject.AccessAuthen.push({uid:'', ViewOnly:false});
	}

	$scope.removeUser = function(index){
		$scope.subject.AccessAuthen.splice(index,1);
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

	$scope.generateGID = function(){

		$http.get('/raw/subjectInfo/' +'All/All/All/All/All/All/All/All/All')
		.success(function(response){
			console.log(response);
			
			var subjectIDs = [];
			for (var subject in response)
			{
				subjectIDs.push(response[subject].ID);
			}

			console.log(subjectIDs);
			var randGID = SubrandomIDgenerator(subjectIDs);
			$scope.subject.ID = randGID;

			return Promise.resolve(subjectIDs);
			
		})
	}



	//=============================== Other stuff ================================

	var subjects = $scope.subjects;
   	$scope.propertyName = 'ID';
  	$scope.reverse = false;
  	$scope.subjects = orderBy(subjects, $scope.propertyName, $scope.reverse);

  	$scope.sortBy = function(propertyName) {
  		console.log(propertyName, $scope.subjects);
	    $scope.reverse = (propertyName !== null && $scope.propertyName === propertyName)
	        ? !$scope.reverse : false;
	    $scope.propertyName = propertyName;
	    $scope.subjects = orderBy($scope.subjects, $scope.propertyName, $scope.reverse);
	};

//================================= Pagination ===============================

	$scope.maxSize = 5; //number of page buttons
	$scope.currentPage = 1;
	$scope.viewby = 15;
	$scope.itemsPerPage = $scope.viewby;

	$scope.setItemsPerPage = function(num) {
	  $scope.itemsPerPage = num;
	  $scope.currentPage = 1; //reset to first page
	}



}]);

myApp.controller('addSubjectController', ['$rootScope','$state', '$scope', '$http', '$location', '$stateParams', 'authenFact',
	function ($rootScope, $state, $scope, $http, $location, $stateParams, authenFact){
	console.log('addSubjectController loaded');
	console.log(authenFact.getAccessToken());
	

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
					$state.go('subjects');
					alert("You are not authorized to add new subjects" + " !");
					$rootScope.adminloggedin = false;
				}

				else
				{
					$state.go('addSubject');
					$rootScope.adminloggedin = true;
				}
			})
			
		}

		$scope.getAuthenProjectList = function(){
			var uid = authenFact.getAccessToken().uid;
			$http.get('/raw/projects-authen').success(function(response){
					
				var authenProjects = [];
				for (var num in response)
				{
					var id = response[num].ProjectID;
					var authenList = response[num].AccessAuthen;
					var _uid = authenFact.getAccessToken().uid;

					for (var i in authenList)
					{
						if (authenList[i].uid == _uid && authenList[i].ViewOnly == false)
						{
							authenProjects.push({ProjectID: id, ProjectName: name});
						}
						else if (authenList[i].uid == 'AllUsers' && authenList[i].ViewOnly == false)
						{
							authenProjects.push({ProjectID: id, ProjectName: name});
						}
					}
				}

				$scope.AuthenProjects = authenProjects;
			});
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
				$scope.error = err.data;
			});
		}


		$scope.generateGID = function(){

			$http.get('/raw/subjectInfo/' +'All/All/All/All/All/All/All/All/All')
			.success(function(response){
				console.log(response);
				
				var subjectIDs = [];
				
				if (response != "no match!")
				{
					for (var subject in response)
					{
						console.log(response[subject].ID);
						subjectIDs.push(response[subject].ID);
					}
				}
				

				console.log(subjectIDs);
				var randGID = SubrandomIDgenerator(subjectIDs);
				$scope.subject.ID = randGID;

				return Promise.resolve(subjectIDs);
				
			})
		}	

	}

}]);


function SubrandomIDgenerator (subjectIDs){

	do
	{
		var newID = Math.floor((Math.random()*100000)+1);

		console.log(newID);

		for (var id in subjectIDs)
		{
			console.log(subjectIDs[id]);
		}

		var MJTnewID = "MJT"+newID;

	} while (subjectIDs.indexOf(MJTnewID) != -1)

	return MJTnewID;


}