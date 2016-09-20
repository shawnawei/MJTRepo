var myApp = angular.module('myApp');

myApp.controller('scanSessionsController', ['$rootScope', '$state','$scope', '$http', '$location', '$stateParams', 'authenFact',
	function ($rootScope, $state, $scope, $http, $location, $stateParams, authenFact){
	console.log('scanSessionsController loaded');


	if (!authenFact.getAccessToken())
	{
		$state.go('login');
	}
	else
	{
		console.log("logged in as: "+ authenFact.getAccessToken().uid);
		$rootScope.loggedin = true;
	}

	var sessionID = $stateParams.SessionID;
	var projectID = $stateParams.ProjectID;
	var subjectID = $stateParams.SubjectIDinProject;
	$scope.oldsessionID = sessionID;
	$scope.ProjectID = projectID;
	$scope.SubjectIDinProject = subjectID;
	$scope.forbidden = true;

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

			if (!adminTypes.includes(uid))
			{				
				$rootScope.adminloggedin = false;
			}

			else
			{
				$rootScope.adminloggedin = true;
			}
		})
		
	}

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
			//console.log(viewList, editList);
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
			//console.log(response);
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
		.then(function(response){
			window.location.href = '/ScanInfo/'+ projectID + '/'+ subjectID;
		})
		.catch(function(err){
			console.log(err);
			$scope.error = err.data;
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
		

	var selectedMEGs = [];
	var selectedMRIs = [];
	var selectedTests = [];

	$scope.exportData = function(scanSessions, subjectInfo){

		var MEGs = scanSessions.MEGScans;
		var MRIs = scanSessions.MRIScans;
		var Tests = scanSessions.TestResults;

		for (var num in MEGs)
		{
			if (MEGs[num].selected == true)
			{
				selectedMEGs.push(MEGs[num]);
			}
			else
			{
				var index = selectedMEGs.indexOf(MEGs[num]);
				if(index > -1){
					selectedMEGs.splice(index, 1);
				}
			}
		}

		for (var num in MRIs)
		{
			if (MRIs[num].selected == true)
			{
				selectedMRIs.push(MRIs[num]);
			}
			else
			{
				var index = selectedMRIs.indexOf(MRIs[num]);
				if(index > -1){
					selectedMRIs.splice(index, 1);
				}
			}
		}

		for (var num in Tests)
		{
			if (Tests[num].selected == true)
			{
				selectedTests.push(Tests[num]);
			}
			else
			{
				var index = selectedTests.indexOf(Tests[num]);
				if(index > -1){
					selectedTests.splice(index, 1);
				}
			}
		}

		// console.log(selectedMEGs);
		// console.log(selectedMRIs);
		// console.log(selectedTests);
		// console.log(subjectInfo);
		var tobeExportedMEG = formatToExcel_MEGs(selectedMEGs);
		var tobeExportedMRI = formatToExcel_MRIs(selectedMRIs);
		var tobeExportedTests = formatToExcel_Tests(selectedTests);
		var tobeExportedSubjectInfo = formatToExcel_SubjectInfo(subjectInfo);
		// console.log(tobeExportedMEG, tobeExportedMRI, tobeExportedTests);

		var opts = [{
			sheetid:'MEGs',header:true},
			{sheetid:'MRIs',header:true},
			{sheetid:'Tests',header:true},
			{sheetid:'SubjectInfo',header:false}];

    	alasql('SELECT INTO XLSX("scansInSession.xlsx",?) FROM ?',
                     [opts,[tobeExportedMEG, tobeExportedMRI, tobeExportedTests, tobeExportedSubjectInfo]]);
		
		// alasql('SELECT * INTO XLSX("scansInSession.xlsx",{headers:true}) FROM ?', 
		// 	[tobeExported]);
	}


	$scope.selectMEGAll = function(sessions){
		selectedMEGs = [];
		for (var num in sessions)
		{
			sessions[num].selected = true;
		}
	}

	$scope.deselectMEGAll = function(sessions){
		selectedMEGs = [];
		for (var num in sessions)
		{
			sessions[num].selected = false;
		}
		var tobeExportedMEG = [];
		//$scope.getArray = tobeExported;
	}

	$scope.selectMRIAll = function(sessions){
		selectedMRIs = [];
		for (var num in sessions)
		{
			sessions[num].selected = true;
		}
	}

	$scope.deselectMRIAll = function(sessions){
		selectedMRIs = [];
		for (var num in sessions)
		{
			sessions[num].selected = false;
		}
		var tobeExportedMRI = [];
		//$scope.getArray = tobeExported;
	}

	$scope.selectTestAll = function(sessions){
		selectedTests = [];
		for (var num in sessions)
		{
			sessions[num].selected = true;
		}
	}

	$scope.deselectTestAll = function(sessions){
		selectedTests = [];
		for (var num in sessions)
		{
			sessions[num].selected = false;
		}
		var tobeExportedTests = [];
		//$scope.getArray = tobeExported;
	}

	$scope.ToScanChangelog = function(docID){
		//console.log(docType);
		window.open("/changelogscans/" + docID);
	}

	$scope.ToOneScanChangelog = function(docID){
		console.log(docID);
		$http.get('/raw/changelog/'+ docID).success(function(response){
			$scope.changelog = response;
			$scope.totalItems = response.length;
		});
	}

	$scope.removeRecord = function(change){
		console.log(change);
		var changeID = change._id;

		$http.delete('/raw/changelog/'+ changeID)
			.success(function(response){
			});
		
	}

	$scope.numPerPage = 1;

	$scope.calculatePageNum = function(numPerPage){

		console.log(numPerPage);
		var decpageNum = ($scope.totalItems)/(numPerPage);
		var pageNum = Math.ceil(decpageNum);
		console.log(pageNum);

		//create an array
		var pageArray = [];
		for (var i = 1; i <= pageNum; i++)
		{
			pageArray.push(i);
		}
		$scope.pageArray = pageArray;

	}



}]);



myApp.controller('addScanSessionController', ['$rootScope', '$state', '$scope', '$http', '$location', '$stateParams', 'authenFact',
	function ($rootScope, $state,$scope, $http, $location, $stateParams, authenFact){
	console.log('addScanSessionController loaded');

	// $scope.checkAuthen = function(){
	// 	if (authenFact.getAccessToken().uid != 'shawnawei')
	// 	{
	// 		$state.go('scanDetails', {'ProjectID': $stateParams.ProjectID, 'SubjectIDinProject':$stateParams.SubjectIDinProject});
	// 		alert("You are not authorized to add new scans to project "+ $stateParams.ProjectID + " !");
	// 	}
	// }

	if (!authenFact.getAccessToken())
	{
		$state.go('login');
	}
	else
	{
		console.log("logged in as: "+ authenFact.getAccessToken().uid);
		$rootScope.loggedin = true;
	}

	$scope.getNextSessionID = function(){
		var projectID = $stateParams.ProjectID;
		var subjectID = $stateParams.SubjectIDinProject;
		$http.get('/raw/scanSession/'+ projectID + '/' +subjectID)
		.then(function(response){
			//console.log(response);
			if (response.data != null)
			{
				var sessionIDLength = response.data.ScanSessions.length;
				$scope.newSessionID = '0'+ (sessionIDLength+1);
				//console.log($scope.newSessionID);
			}
		})
		.then(function(response){
			var newID = $scope.newSessionID;
			$scope.newSession = {
				"SessionID": subjectID+'_'+newID,
				"MEGScans":[],
				"MRIScans":[],
				"TestResults": []
			};
		});
	}

	// var newID = $scope.newSessionID;
	// $scope.newSession = {
	// 	"SessionID": '',
	// 	"MEGScans":[],
	// 	"MRIScans":[],
	// 	"TestResults": []
	// };

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

			if (!adminTypes.includes(uid))
			{				
				$rootScope.adminloggedin = false;
			}

			else
			{
				$rootScope.adminloggedin = true;
			}
		})
		
	}

	$scope.getTestTypes = function(){

		var testTypes = [];
		$http.get('raw/testTypes').success(function(response){
			for (var num in response)
			{
				testTypes.push(response[num].TestID);
			}
			$scope.testTypes = testTypes;

			var quicktesttypes = [];
			for (var num in testTypes)
			{
				quicktesttypes.push({TestType: testTypes[num], Add: false});
			}
			$scope.quicktesttypes = quicktesttypes;
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

		//console.log('add scanSession');
		var projectID = $stateParams.ProjectID;
		var subjectID = $stateParams.SubjectIDinProject;

		$scope.SubjectIDinProject = subjectID;
		$scope.ProjectID = projectID;

		$http.post('/raw/scanSession/'+ projectID + '/' + subjectID, $scope.newSession)
		.then(function(response){
			window.location.href= '/ScanInfo/'+ projectID + '/'+ subjectID;
		})
		.catch(function(err){
			//console.log(err);
			$scope.error = err.data;
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

	$scope.quicktestdate = '';

	$scope.quickAddTest = function(){

		$scope.newSession.TestResults = [];

		var qtesttypes = $scope.quicktesttypes;
		// var temptests = $scope.newSession.TestResults;
		// var temptesttypes = temptests.map(function(cv){return cv.Type});
		// console.log(temptests, temptesttypes);

		console.log(qtesttypes);

		for (var num in qtesttypes)
		{
			if (qtesttypes[num].Add == true)
			{
				$scope.newSession.TestResults.push(
				{Type:qtesttypes[num].TestType, Result:'', Comment:'', TestDate:$scope.quicktestdate, Age:''});
			}
		}


		// for (var num in qtesttypes)
		// {
		// 	//console.log(temptesttypes);
		// 	if (qtesttypes[num].Add == true)
		// 	{

		// 		if (!temptesttypes.includes(qtesttypes[num].TestType))
		// 		{
		// 			$scope.newSession.TestResults.push(
		// 			{Type:qtesttypes[num].TestType, Result:'', Comment:'', TestDate:$scope.quicktestdate, Age:''});
		// 		}
				
				
		// 	}
		// }
		//console.log($scope.quicktesttypes, $scope.quicktestdate);
	}

	$scope.addTestType = function(){
		$scope.newSession.TestResults.push({Type:'', Result:'', Comment:'', TestDate:'', Age:''});
	}

	$scope.removeTestType = function(index){
		$scope.newSession.TestResults.splice(index,1);
	}

}]);



function formatToExcel_MEGs (selectedMEGs) {

	var tobeExported = [];

	if (selectedMEGs.length < 1)
	{
		var scanSession = {
			// 'SUBJECT ID': selectedMEGs[num].SubjectID,
			// 'Sex': selectedMEGs[num].SubjectInfo.Sex,
			// 'Diagnosis': selectedMEGs[num].SubjectInfo.Diagnosis,
			// 'SESSION ID': selectedMEGs[num].ScanSessions.SessionID,
			// 'IN PROJECT': selectedMEGs[num].relatedProject + "/" + selectedMEGs[num].SubjectIDinProject
			MEG_Name: "",
			MEG_Date: "",
			MEG_Type:"",
			MEG_Path:"",
			MEG_AgeAtScan: "",
			MEG_Approved: "",
			MEG_Comment: ""
		}

		tobeExported.push(scanSession);
		return tobeExported;
	}
	else
	{
		for (var num in selectedMEGs)
		{
			var scanSession = {
				// 'SUBJECT ID': selectedMEGs[num].SubjectID,
				// 'Sex': selectedMEGs[num].SubjectInfo.Sex,
				// 'Diagnosis': selectedMEGs[num].SubjectInfo.Diagnosis,
				// 'SESSION ID': selectedMEGs[num].ScanSessions.SessionID,
				// 'IN PROJECT': selectedMEGs[num].relatedProject + "/" + selectedMEGs[num].SubjectIDinProject
				MEG_Name: selectedMEGs[num].ScanName,
				MEG_Date: selectedMEGs[num].ScanDate,
				MEG_Type: selectedMEGs[num].ScanType,
				MEG_Path: selectedMEGs[num].ScanPath,
				MEG_AgeAtScan: selectedMEGs[num].AgeAtScan,
				MEG_Approved: selectedMEGs[num].Allowed,
				MEG_Comment: selectedMEGs[num].Comment
			}

			tobeExported.push(scanSession);
		}

		console.log(tobeExported);
		return tobeExported;
	}
	
}

function formatToExcel_MRIs (selectedMRIs) {

	var tobeExported = [];

	if (selectedMRIs.length < 1)
	{
		var scanSession = {
			// 'SUBJECT ID': selectedMEGs[num].SubjectID,
			// 'Sex': selectedMEGs[num].SubjectInfo.Sex,
			// 'Diagnosis': selectedMEGs[num].SubjectInfo.Diagnosis,
			// 'SESSION ID': selectedMEGs[num].ScanSessions.SessionID,
			// 'IN PROJECT': selectedMEGs[num].relatedProject + "/" + selectedMEGs[num].SubjectIDinProject
			MRI_Name: "",
			MRI_Date: "",
			MRI_Type:"",
			MRI_Path:"",
			MRI_AgeAtScan: "",
			MRI_Approved: "",
			MRI_Comment: ""
		}

		tobeExported.push(scanSession);
		return tobeExported;
	}

	else
	{
		for (var num in selectedMRIs)
		{
			var scanSession = {
				// 'SUBJECT ID': selectedMEGs[num].SubjectID,
				// 'Sex': selectedMEGs[num].SubjectInfo.Sex,
				// 'Diagnosis': selectedMEGs[num].SubjectInfo.Diagnosis,
				// 'SESSION ID': selectedMEGs[num].ScanSessions.SessionID,
				// 'IN PROJECT': selectedMEGs[num].relatedProject + "/" + selectedMEGs[num].SubjectIDinProject
				MRI_Name: selectedMRIs[num].ScanName,
				MRI_Date: selectedMRIs[num].ScanDate,
				MRI_Type: selectedMRIs[num].ScanType,
				MRI_Path: selectedMRIs[num].ScanPath,
				MRI_AgeAtScan: selectedMRIs[num].AgeAtScan,
				MRI_Approved: selectedMRIs[num].Allowed,
				MRI_Comment: selectedMRIs[num].Comment
			}

			tobeExported.push(scanSession);
		}

		console.log(tobeExported);
		return tobeExported;
	}
	
}

function formatToExcel_Tests (selectedTests) {

	var tobeExported = [];

	if (selectedTests.length < 1)
	{
		var scanSession = {
			// 'SUBJECT ID': selectedMEGs[num].SubjectID,
			// 'Sex': selectedMEGs[num].SubjectInfo.Sex,
			// 'Diagnosis': selectedMEGs[num].SubjectInfo.Diagnosis,
			// 'SESSION ID': selectedMEGs[num].ScanSessions.SessionID,
			// 'IN PROJECT': selectedMEGs[num].relatedProject + "/" + selectedMEGs[num].SubjectIDinProject
			Test_Type: "",
			Test_Date: "",
			Test_Age: "",
			Test_Result:"",
			Test_Comment: ""
		}

		tobeExported.push(scanSession);
		return tobeExported;
	}

	else
	{
		for (var num in selectedTests)
		{
			var scanSession = {
				// 'SUBJECT ID': selectedMEGs[num].SubjectID,
				// 'Sex': selectedMEGs[num].SubjectInfo.Sex,
				// 'Diagnosis': selectedMEGs[num].SubjectInfo.Diagnosis,
				// 'SESSION ID': selectedMEGs[num].ScanSessions.SessionID,
				// 'IN PROJECT': selectedMEGs[num].relatedProject + "/" + selectedMEGs[num].SubjectIDinProject
				Test_Type: selectedTests[num].Type,
				Test_Date: selectedTests[num].TestDate,
				Test_Age: selectedTests[num].Age,
				Test_Result: selectedTests[num].Result,
				Test_Comment: selectedTests[num].Comment
			}

			tobeExported.push(scanSession);
		}

		console.log(tobeExported);
		return tobeExported;
	}
	
}


function formatToExcel_SubjectInfo (selectedSubject) {
	//console.log(selectedSubject);

	var projectList = selectedSubject.SubjectInfo.Projects;
	var projects = [];
	for (var i in projectList)
	{
		projects.push(projectList[i].ProjectID);
	}

	var scanSession = {
		'Subject ID': selectedSubject.SubjectIDinProject,
		'For Project': selectedSubject.relatedProject,
		'Sex': selectedSubject.SubjectInfo.Sex,
		'Diagnosis': selectedSubject.SubjectInfo.Diagnosis,
		'Handedness': selectedSubject.SubjectInfo.Handedness,
		'In Projects': projects
	}
	var tobeExported = [];
	tobeExported.push(scanSession);
	
	return tobeExported;
	
}