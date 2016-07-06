var myApp = angular.module('myApp');

myApp.controller('scanSessionsController', [ '$state','$scope', '$http', '$location', '$stateParams', 'authenFact',
	function ($state, $scope, $http, $location, $stateParams, authenFact){
	console.log('scanSessionsController loaded');

	console.log("logged in: "+ authenFact.getAccessToken());

	if (!authenFact.getAccessToken())
	{
		$state.go('login');
	}


	$scope.getScanSession = function(){
		var projectID = $stateParams.ProjectID;
		var subjectID = $stateParams.SubjectIDinProject;
		$http.get('/raw/scanSession/'+ projectID + '/' +subjectID)
		.success(function(response){
			$scope.scanSession = response;
		});
	}

	$scope.getSingleScanSession = function(){
		var projectID = $stateParams.ProjectID;
		var subjectID = $stateParams.SubjectIDinProject;
		var sessionID = $stateParams.SessionID;
		$http.get('/raw/scanSession/'+ projectID + '/' +subjectID +'/' + sessionID)
		.success(function(response){
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
		$http.delete('/raw/scanSession/'+ projectID + '/'+ subjectID +'/'+ sessionID)
		.success(function(response){
			window.location.href= '/ScanInfo/'+ projectID + '/'+ subjectID ;
		});
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

	$scope.addScanSession = function(){

		console.log('add scanSession');
		var projectID = $stateParams.ProjectID;
		var subjectID = $stateParams.SubjectIDinProject;

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