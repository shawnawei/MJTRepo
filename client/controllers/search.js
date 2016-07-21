var myApp = angular.module('myApp');

//=============================================================================================
//================================= Search request page =======================================
//=============================================================================================

myApp.controller('searchController', ['$rootScope','$state', '$scope', '$http', '$location', '$stateParams', 'authenFact',
	function($rootScope, $state, $scope, $http, $location, $stateParams,authenFact){

//=============================== Subjects ==============================

	
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
				var _uid = authenFact.getAccessToken().uid;

				for(var num in Users)
				{
					if (Users[num].uid == _uid)
					{
						var usertype = Users[num].Type;
					}
				}

				if (usertype != 'admin')
				{
					$rootScope.adminloggedin = false;
				}

				else
				{
					$rootScope.adminloggedin = true;
				}
			})
		}


		$scope.getSubjects = function(){
			$http.get('/raw/subjects').success(function(response){
				$scope.subjects = response;
			});
		}

		$scope.searchSubjectByGlobalID = function(id){
			$location.path('/searchResult-GlobalID').search('GlobalID',id);
		}

		$scope.searchSubjectByinProjectID = function(id){
			$location.path('/searchResult-inProjectID').search('inProjectID',id);
		}

		$scope.searchSubjectByOther = function(searchObj){
			var sex = searchObj.Sex;
			var handedness = searchObj.Handedness;
			var diagnosis = searchObj.Diagnosis;
			var contactpermit = searchObj.ContactPermit;
			var age = searchObj.CurrentAge;
			var MRN = searchObj.MRN;
			var firstname = searchObj.FirstName;
			var lastname = searchObj.LastName;

			console.log(firstname, lastname);

			if(searchObj.Projects !='')
			{
				var projects = searchObj.Projects;
			}

			$location.path('/searchResult-SubjectInfo').search({
				'Sex':sex, 'Handedness':handedness, 'Diagnosis':diagnosis, 'Contact': contactpermit,
				'Age': age, 'MRN':MRN ,'FirstName':firstname, 'LastName':lastname, 'Projects':projects
			});
		}


	//=============================== Projects ===================================

		$scope.getProjects = function(){
			$http.get('/raw/projects').success(function(response){
				var projectOpts = [];
				for (var num in response)
				{
					console.log("hi" + num + response[num]);
					projectOpts.push({id:num, label:response[num].ProjectID});
				}
				$scope.projects = projectOpts;

			});
		}

		$scope.searchProjectByID = function(id){
			$location.path('/searchResult-ProjectID').search('ProjectID',id);
		}

		$scope.searchProjectByName = function(name){
			$location.path('/searchResult-ProjectName').search('ProjectName',name);
		}


	//=============================== Scan Sessions ==============================

		$scope.filterSubjects = [];
		$scope.filterSubjectsInfo = [];
		$scope.searchTestType = [];

		$scope.getScanSessions = function(){
			$http.get('/raw/scanSessions').success(function(response){
				$scope.scanSessions = response;
			});
		}

		$scope.searchScanByGID = function(id){
			$location.path('/searchResult-ScanGID').search('GlobalID',id);
		}

		$scope.searchScanByPID = function(id){
			$location.path('/searchResult-ScanPID').search('inProjectID',id);
		}

		$scope.searchScanBySessionID = function(searchObj){
			var sessionID = searchObj.SessionID;

			$location.path('/searchResult-ScanSessionID').search({'SessionID':sessionID});
		}

		$scope.searchScanByInfo = function(searchObj, filterSubjects, filterSubjectsInfo, searchTestType, allProjects,
		 MRITypes, MEGTypes, allTestTypes,allGIDs, allPIDs){

			if(filterSubjectsInfo.length != 0)
			{

				console.log("hi");
				filterSubjects = [];
				var Sex = filterSubjectsInfo[0].Sex;
				var Diagnosis = filterSubjectsInfo[0].Diagnosis;

				if (Sex == undefined)
				{
					Sex = 'All';
				}

				if (Diagnosis == undefined)
				{
					Diagnosis = 'All'
				}
				
				var Projects = 'All';
				var Handedness = 'All';


				console.log(Sex, Diagnosis);

				$http.get('/raw/subjectInfo/' + Sex +'/' + Handedness +'/' + Diagnosis +'/'
				+ 'All/All/All/All/All' + '/' + Projects)
				.then(function(response){
					var matchingSubject = response.data;
					
					for (var num in matchingSubject)
					{
						filterSubjects.push({SubjectID: matchingSubject[num].ID, inProjectID:''});
						//console.log(filterSubjects);
					}
				})

				.then(function(){

					var ageAtScanmin = searchObj.ParticipantAge.min;
					var ageAtScanmax = searchObj.ParticipantAge.max;
					var allowed = searchObj.Allowed;
					var MEGType = searchObj.MEGType;
					var MRIType = searchObj.MRIType;
					var projects = searchObj.Projects;
					var testTypes = [];

					if (searchTestType.length == 0)
					{
						testTypes = allTestTypes;
					}

					if(searchTestType.length > 0)
					{
						for (var n in searchTestType)
						{
							testTypes.push(searchTestType[n].Type);
						}
					}
					
					console.log(filterSubjects, searchTestType);
					
					if (filterSubjects.length != 0)
					{
						var GID = [];
						var PID = [];
						filterSubjects.map(function(cv){
							if (cv.SubjectID != '')
							  GID.push(cv.SubjectID);
						})

						filterSubjects.map(function(cv){
							if (cv.inProjectID != '')
							  PID.push(cv.inProjectID);
						})

						if (PID.length == 0)
						{
							var PID = ['nomatch'];
						}
						if (GID.length == 0)
						{
							var GID = ['nomatch'];
						}
					}

					else if (filterSubjects.length == 0)
					{
						var GID = allGIDs;
						var PID = allPIDs;
					}
					


					if(allowed == null)
					{
						allowed = "All";
					}

					if (MEGType == null || MEGType[0] == "All")
					{
						MEGType = MEGTypes;
					}

					if (MEGType[0] == "None")
					{
						MEGType = ['None'];
					}

					if (MRIType == null || MRIType[0] == "All")
					{
						MRIType = MRITypes;
					}
					
					if (MRIType[0] == "None")
					{
						MRIType = ['None'];
					}

					if (MRIType == null || MRIType[0] == "All")
					{
						MRIType = MRITypes;
					}
					
					if (MRIType[0] == "None")
					{
						MRIType = ['None'];
					}

					if (projects == null || projects[0] == "All")
					{
						
						projects = allProjects;
					}

					console.log(GID, PID);


					$location.path('/searchResult-ScanInfo').search({'minAge': ageAtScanmin, 'maxAge':ageAtScanmax,
					'Allowed': allowed, 'MEGType': MEGType, 'MRIType': MRIType, 'testType':testTypes, 'Projects':projects, 
					'SubjectGID': GID, 'SubjectPID': PID});
				})
			}

			else
			{
				
				var ageAtScanmin = searchObj.ParticipantAge.min;
				var ageAtScanmax = searchObj.ParticipantAge.max;
				var allowed = searchObj.Allowed;
				var MEGType = searchObj.MEGType;
				var MRIType = searchObj.MRIType;
				var projects = searchObj.Projects;
				var testTypes = [];


					if (searchTestType.length == 0 || searchTestType == undefined)
					{
						testTypes = allTestTypes;
					}

					if(searchTestType.length > 0)
					{
						for (var t in searchTestType)
						{
							testTypes.push(searchTestType[t].Type);
						}
					}

				
				if (filterSubjects.length != 0)
				{
					var GID = [];
					var PID = [];
					filterSubjects.map(function(cv){
						if (cv.SubjectID != '')
						  GID.push(cv.SubjectID);
					})

					filterSubjects.map(function(cv){
						if (cv.inProjectID != '')
						  PID.push(cv.inProjectID);
					})

					if (PID.length == 0)
					{
						var PID = ['nomatch'];
					}
					if (GID.length == 0)
					{
						var GID = ['nomatch'];
					}
				}

				else if (filterSubjects.length == 0)
				{
					var GID = allGIDs;
					var PID = allPIDs;
				}
				


				if(allowed == null)
				{
					allowed = "All";
				}

				if (MEGType == null || MEGType[0] == "All")
				{
					MEGType = MEGTypes;
				}

				if (MEGType[0] == "None")
				{
					MEGType = ['None'];
				}

				if (MRIType == null || MRIType[0] == "All")
				{
					MRIType = MRITypes;
				}
				
				if (MRIType[0] == "None")
				{
					MRIType = ['None'];
				}

				if (projects == null || projects[0] == "All")
				{
					
					projects = allProjects;
				}

				console.log(GID, PID);

				$location.path('/searchResult-ScanInfo').search({'minAge': ageAtScanmin, 'maxAge':ageAtScanmax,
				'Allowed': allowed, 'MEGType': MEGType, 'MRIType': MRIType, 'testType':testTypes, 'Projects':projects, 
				'SubjectGID': GID, 'SubjectPID': PID});
			}	
			
		}

		
		$scope.addSubject = function(){
			$scope.filterSubjectsInfo = [];
			$scope.filterSubjects.push({SubjectID: '', inProjectID: ''});
		}

		$scope.addSubjectInfo = function(){
			//only one element in the array
			$scope.filterSubjects = [];
			$scope.filterSubjectsInfo = [];
			$scope.filterSubjectsInfo.push({Sex:'', Diagnosis:''});
		}

		$scope.removeSubject = function(index){
			$scope.filterSubjects.splice(index,1);
		}

		$scope.removeSubjectInfo = function(index){
			$scope.filterSubjectsInfo.splice(index,1);
		}

		$scope.addTestType = function(){
			$scope.searchTestType.push({Type:'', Result:''});
		}

		console.log("testTypes: " + $scope.searchTestType);

		$scope.removeTestType = function(index){
			$scope.searchTestType.splice(index,1);
		}


		$scope.getProjects = function(){
			$http.get('/raw/projects').success(function(response){
				$scope.projects = response;
			});
		}

		$scope.getSubjectIDs = function(){
			var subjects = [];
			$http.get('/raw/subjects').then(function(response){
				console.log(response);

				if (response.data.length == 0)
				{
					console.log("hi");
					subjects.push("nomatch");
				}

				else
				{
					for (var num in response.data)
					{
						subjects.push(response.data[num].ID);
					}
				}

				$scope.allSubjects = subjects;
				
			});
		}

		$scope.getinProjectIDs = function(){
			var inProjectIDs = [];
			$http.get('/raw/scanSessions').success(function(response){
				for (var num in response)
				{
					inProjectIDs.push(response[num]. SubjectIDinProject);
				}
				$scope.allinProjectIDs = inProjectIDs;
			});
		}

		$scope.getTestTypes = function(){

			var testTypes = [];
			$http.get('raw/testTypes').success(function(response){
				for (var num in response)
				{
					testTypes.push(response[num].TestID);
				}
				$scope.testTypes = testTypes;
			});
		}

		$scope.getMRITypes = function(){

			var MRITypes = [];
			$http.get('raw/MRITypes').success(function(response){
				for (var num in response)
				{
					MRITypes.push(response[num].TypeID);
				}
				$scope.MRITypes = MRITypes;
			});
		}

		$scope.getProjectIDs = function(){

			var projects = [];
			$http.get('/raw/projects').success(function(response){
				for (var num in response)
				{
					projects.push(response[num].ProjectID);
				}
				$scope.allProjects = projects;
			});
		}

		$scope.getMEGTypes = function(){

			var MEGTypes = [];
			$http.get('raw/MEGTypes').success(function(response){
				for (var num in response)
				{
					MEGTypes.push(response[num].TypeID);
				}
				$scope.MEGTypes = MEGTypes;
			});
		}


	//=============================== Other stuff ================================

		$scope.projectFilter = function (item)
		{
		    if ($scope.search.Projects == '' || $scope.search.Projects.length == 0 || $scope.search.Projects == undefined){
		        return true;
		    }  

		    for (var i in $scope.search.Projects){         
		        for (var j in item.Projects){
		            if (item.Projects[j].ProjectID == $scope.search.Projects[i]){
		                return true;
		            }
		        }
		    }
		    return false;
		}

		$scope.sortColumn = "";
		$scope.reverseSort = false;
		$scope.sortData = function(column){
			$scope.reverseSort = ($scope.sortColumn == column)? !$scope.reverseSort: false;
			$scope.sortColumn = column;

		};

		$scope.getSortClass = function(column){
			if ($scope.sortColumn == column){
				return $scope.reverseSort ? 'arrow-down' : 'arrow-up'
			}
			return '';
		}
	}
	
}]);




function filterSubject (filterSubjects){

	console.log(filterSubjects);

	var ageAtScanmin = searchObj.ParticipantAge.min;
	var ageAtScanmax = searchObj.ParticipantAge.max;
	var allowed = searchObj.Allowed;
	var MEGType = searchObj.MEGType;
	var MRIType = searchObj.MRIType;
	var projects = searchObj.Projects;

	if (filterSubjects.length != 0)
	{
		var GID = [];
		var PID = [];
		filterSubjects.map(function(cv){
			if (cv.SubjectID != '')
			  GID.push(cv.SubjectID);
		})

		filterSubjects.map(function(cv){
			if (cv.inProjectID != '')
			  PID.push(cv.inProjectID);
		})

		if (PID.length == 0)
		{
			var PID = ['nomatch'];
		}
		if (GID.length == 0)
		{
			var GID = ['nomatch'];
		}
	}

	else if (filterSubjects.length == 0)
	{
		var GID = allGIDs;
		var PID = allPIDs;
	}
	


	if(allowed == null)
	{
		allowed = "All";
	}

	if (MEGType == null || MEGType[0] == "All")
	{
		MEGType = MEGTypes;
	}

	if (MEGType[0] == "None")
	{
		MEGType = ['None'];
	}

	if (MRIType == null || MRIType[0] == "All")
	{
		MRIType = MRITypes;
	}
	
	if (MRIType[0] == "None")
	{
		MRIType = ['None'];
	}

	if (projects == null || projects[0] == "All")
	{
		
		projects = allProjects;
	}


	$location.path('/searchResult-ScanInfo').search({'minAge': ageAtScanmin, 'maxAge':ageAtScanmax,
	'Allowed': allowed, 'MEGType': MEGType, 'MRIType': MRIType, 'Projects':projects, 
	'SubjectGID': GID, 'SubjectPID': PID});
}