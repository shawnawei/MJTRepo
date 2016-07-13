var myApp = angular.module('myApp');

myApp.controller('scanSessionsController', [ '$state','$scope', '$http', '$location', '$stateParams', 'authenFact',
	function ($state, $scope, $http, $location, $stateParams, authenFact){
	console.log('scanSessionsController loaded');

	console.log("logged in: "+ authenFact.getAccessToken());

	if (!authenFact.getAccessToken())
	{
		$state.go('login');
	}

	var sessionID = $stateParams.SessionID;
	var projectID = $stateParams.ProjectID;
	var subjectID = $stateParams.SubjectIDinProject;
	$scope.oldsessionID = sessionID;
	$scope.ProjectID = projectID;
	$scope.SubjectIDinProject = subjectID;
	$scope.forbidden = true;

	$scope.getAuthenList = function(forbidden){
		
		var projectID = $stateParams.ProjectID;
		var subjectIDinProject = $stateParams.SubjectIDinProject;
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

			if ($scope.editList == [])
			{
				if(forbidden == true)
				{
					$state.go('scanDetails', {ProjectID: projectID, SubjectIDinProject: subjectIDinProject});
					alert("You are not authorized to edit this scan session!");
				}
				else
				{
					$scope.editable = false;
				}
				
			}

			else if (!$scope.editList.includes(accessToken) && !$scope.editList.includes('AllUsers'))
			{
				if(forbidden == true)
				{
					$state.go('scanDetails', {ProjectID: projectID, SubjectIDinProject: subjectIDinProject});
					alert("You are not authorized to edit this scan session!");
				}
				else
				{
					$scope.editable = false;
				}
			}

			else {
				$scope.editable = true;
			}

			});	
	}

	$scope.getAuthenEditList = function(projectID, subjectIDinProject, sessionID){

		var viewList = [];
		var editList = [];
		console.log("session ID " + sessionID);

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

			if ($scope.editList == [])
			{
				$state.go('scanDetails', {ProjectID: projectID, SubjectIDinProject: subjectIDinProject});
				alert("You are not authorized to edit this scan session!");
			}

			else if (!$scope.editList.includes(accessToken) && !$scope.editList.includes('AllUsers'))
			{
				$state.go('scanDetails', {ProjectID: projectID, SubjectIDinProject: subjectIDinProject});
				alert("You are not authorized to edit this scan session!");
			}

			else {
				if (sessionID == undefined)
				{
					$state.go('addScan', {ProjectID: projectID, SubjectIDinProject: subjectIDinProject});
				}
				else if (sessionID == 'forbidden')
				{
					$state.go('scanDetails', {ProjectID: projectID, SubjectIDinProject: subjectIDinProject});
					alert("You are not authorized to edit this scan session!");
				}
				else
				{
					$state.go('editScan', {ProjectID: projectID, SubjectIDinProject: subjectIDinProject, SessionID: sessionID});
				}
			}	

		});

	}

	$scope.getScanSession = function(){
		var projectID = $stateParams.ProjectID;
		var subjectID = $stateParams.SubjectIDinProject;
		$http.get('/raw/scanSession/'+ projectID + '/' +subjectID)
		.then(function(response){
			console.log(response);
			if (response.data == null)
			{
				$state.go('subjects');
				alert("You are not authorized to view or edit this page!");
			}
			$scope.scanSession = response.data;
		});
	}

	$scope.getSingleScanSession = function(){
		var projectID = $stateParams.ProjectID;
		var subjectID = $stateParams.SubjectIDinProject;
		var sessionID = $stateParams.SessionID;
		$http.get('/raw/scanSession/'+ projectID + '/' +subjectID +'/' + sessionID)
		.success(function(response){
			console.log(response);
			$scope.scanSession = response.ScanSessions[0];
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






	$scope.addMEGScan = function(){
		$scope.scanSession.MEGScans.push(
			{ScanName: '', ScanDate: '', ScanPath: '', Allowed:false, 
			ScanType: '', AgeAtScan:null, Comment:''});
	}

	$scope.removeMEGScan = function(index){
		$scope.scanSession.MEGScans.splice(index,1);
	}

	$scope.addMRIScan = function(){
		$scope.scanSession.MRIScans.push(
			{ScanName: '', ScanDate: '', ScanPath: '', Allowed:false, 
			 ScanType: '', AgeAtScan:null, Comment:''});
	}

	$scope.removeMRIScan = function(index){
		$scope.scanSession.MRIScans.splice(index,1);
	}


	$scope.addTestType = function(){
		$scope.scanSession.TestResults.push(
			{Type:'', Result:'', Comment:'', TestDate:'', Age:''});
	}

	$scope.removeTestType = function(index){
		$scope.scanSession.TestResults.splice(index,1);
	}


	$scope.editScanSession = function(){
		var projectID = $stateParams.ProjectID;
		var subjectID = $stateParams.SubjectIDinProject;
		var sessionID = $stateParams.SessionID;
		$http.put('/raw/scanSession/'+ projectID + '/'+ subjectID +'/'+ sessionID, $scope.scanSession)
		.success(function(response){
			window.location.href = '/ScanInfo/'+ projectID + '/'+ subjectID;
		});
	}

	$scope.removeScanSession = function(projectID, subjectID, sessionID){

		if (authenFact.getAccessToken().uid != 'shawnawei')
		{
			$state.go('scanDetails', {'ProjectID': $stateParams.ProjectID, 'SubjectIDinProject':$stateParams.SubjectIDinProject});
			alert("You are not authorized to delete scan sessions in project "+ $stateParams.ProjectID + " !");
		}

		else
		{
			$http.delete('/raw/scanSession/'+ projectID + '/'+ subjectID +'/'+ sessionID)
				.success(function(response){
					window.location.href= '/ScanInfo/'+ projectID + '/'+ subjectID ;
				});
			}
		}
		

	$scope.exportData = function(name){
		console.log("oh what");
		var blob = new Blob([document.getElementById('exportable').innerHTML], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8"
        });

        saveAs(blob, name+".xls");
	}

	$scope.selectAll = function(session){
		for (var num in session)
		{
			console.log(session[num]);
			session[num].selected = true;
		}
	}

	$scope.deselectAll = function(session){
		for (var num in session)
		{
			console.log(session[num]);
			session[num].selected = false;
		}
	}

}]);



myApp.controller('addScanSessionController', ['$state', '$scope', '$http', '$location', '$stateParams', 'authenFact',
	function ($state,$scope, $http, $location, $stateParams, authenFact){
	console.log('addScanSessionController loaded');

	$scope.checkAuthen = function(){
		if (authenFact.getAccessToken().uid != 'shawnawei')
		{
			$state.go('scanDetails', {'ProjectID': $stateParams.ProjectID, 'SubjectIDinProject':$stateParams.SubjectIDinProject});
			alert("You are not authorized to add new scans to project "+ $stateParams.ProjectID + " !");
		}
	}

	$scope.newSession = {
		"SessionID": '',
		"ParticipantAge": '',
		"MEGScans":[],
		"MRIScans":[],
		"TestResults": []
	};

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
		

	var projectID = $stateParams.ProjectID;
	var subjectID = $stateParams.SubjectIDinProject;

	$scope.SubjectIDinProject = subjectID;
	$scope.ProjectID = projectID;

	$scope.addScanSession = function(){

		console.log('add scanSession');
		var projectID = $stateParams.ProjectID;
		var subjectID = $stateParams.SubjectIDinProject;

		$scope.SubjectIDinProject = subjectID;
		$scope.ProjectID = projectID;

		$http.post('/raw/scanSession/'+ projectID + '/' + subjectID, $scope.newSession)
		.success(function(response){
			window.location.href= '/ScanInfo/'+ projectID + '/'+ subjectID;
		});
	}

	$scope.addMEGScan = function(){
		$scope.newSession.MEGScans.push(
			{ScanName: '', ScanDate: '', ScanPath: '', Allowed:false, 
			 ScanType: '', AgeAtScan:null, Comment:''});
	}

	$scope.removeMEGScan = function(index){
		$scope.newSession.MEGScans.splice(index,1);
	}

	$scope.addMRIScan = function(){
		$scope.newSession.MRIScans.push(
			{ScanName: '', ScanDate: '', ScanPath: '', Allowed:false,
		 	 ScanType: '', AgeAtScan:'', Comment:''});
	}

	$scope.removeMRIScan = function(index){
		$scope.newSession.MRIScans.splice(index,1);
	}

	$scope.addTestType = function(){
		$scope.newSession.TestResults.push({Type:'', Result:'', Comment:'', TestDate:'', Age:''});
	}

	$scope.removeTestType = function(index){
		$scope.newSession.TestResults.splice(index,1);
	}

}]);