var myApp = angular.module('myApp');

//=============================================================================================
//================================= Search results page =======================================
//=============================================================================================


//=============================== Subjects ==============================

myApp.controller('searchSubjectIDController', ['$state', '$scope', '$http', '$location', '$stateParams','authenFact',
	function($state, $scope, $http, $location, $stateParams, authenFact){

	
	
	$scope.getSubjectsResult = function(){
		var requestSubjectID = $location.search();
		$scope.requestID = requestSubjectID;

		$state.go('searchResult-GlobalID', {GlobalID: requestSubjectID.GlobalID});

		$http.get('/raw/searchsubjects/' + requestSubjectID.GlobalID)
		.then(function(response){
			if(response.data == null){
				$scope.subjects = null;
			}

			else{
				$scope.subjects = response.data;
			}
		});
	}

	var selectedSubject = [];

	$scope.getSelectedSubjects = function(subject){

		//check if the user click or unclick the checkbox
		//if selected, add to the array of selected subjects
		//if not, remove from the array

		if (subject.selected == true)
		{
			selectedSubject.push(subject);
		}
		else
		{
			var index = selectedSubject.indexOf(subject);
			if(index > -1){
				selectedSubject.splice(index, 1);
			}
		}
		var tobeExported = formatToExcel_Subjects(selectedSubject);
		$scope.getArray = tobeExported;
	}

	/*$scope.exportData = function(name){
		console.log("oh what");
		var blob = new Blob([document.getElementById('exportable').innerHTML], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8"
        });

        saveAs(blob, name+".xls");
	}*/

	$scope.selectAll = function(subjects){
		selectedSubject = [];
		for (var num in subjects)
		{
			subjects[num].selected = true;
			selectedSubject.push(subjects[num]);
		}
		var tobeExported = formatToExcel_Subjects(selectedSubject);
		$scope.getArray = tobeExported;
	}

	$scope.deselectAll = function(subjects){
		selectedSubject = [];
		for (var num in subjects)
		{
			subjects[num].selected = false;
		}
		var tobeExported = [];
		$scope.getArray = tobeExported;
	}

	$scope.getHeader = function(){
		return ['Subject ID',
			'Sex',
			'Date of Birth',
			'Diagnosis',
			'Projects(-ID)',
			'Handedness',
			'MRN',
			'Contact for future studies',
			'Comment'];
	}



}]);


myApp.controller('searchInProjectIDController', ['$state', '$scope', '$http', '$location', '$stateParams', function($state, $scope, $http, $location, $stateParams){

	
	
	$scope.getSubjectsResult = function(){
		var requestSubjectID = $location.search();
		$scope.requestID = requestSubjectID;

		$state.go('searchResult-inProjectID', {inProjectID: requestSubjectID.inProjectID});

		$http.get('/raw/subjectsInProject/' + requestSubjectID.inProjectID)
		.then(function(response){

			$scope.what = response.data;
			if(response.data == "no match!"){
				$scope.subjects= {ID:"no match!"};
			}

			else{
				$scope.subjects = response.data;
			}
		})
	}

	var selectedSubject = [];

	$scope.getSelectedSubjects = function(subject){

		if (subject.selected == true)
		{
			selectedSubject.push(subject);
		}
		else
		{
			var index = selectedSubject.indexOf(subject);
			if(index > -1){
				selectedSubject.splice(index, 1);
			}
		}
		var tobeExported = formatToExcel_Subjects(selectedSubject);
		$scope.getArray = tobeExported;
	}


	$scope.selectAll = function(subjects){
		selectedSubject = [];
		for (var num in subjects)
		{
			subjects[num].selected = true;
			selectedSubject.push(subjects[num]);
		}
		var tobeExported = formatToExcel_Subjects(selectedSubject);
		$scope.getArray = tobeExported;
	}

	$scope.deselectAll = function(subjects){
		selectedSubject = [];
		for (var num in subjects)
		{
			subjects[num].selected = false;
		}
		var tobeExported = [];
		$scope.getArray = tobeExported;
	}

	$scope.getHeader = function(){
		return ['Subject ID',
			'Sex',
			'Date of Birth',
			'Diagnosis',
			'Projects(-ID)',
			'Handedness',
			'Contact for future studies',
			'Comment'];
	}

}]);


myApp.controller('searchSubjectInfoController', ['$state', '$scope', '$http', '$location', '$stateParams', function($state, $scope, $http, $location, $stateParams){

	$scope.getSubjectsResult = function(){
		var requestSubject = $location.search();
		

		if(requestSubject.Sex == undefined)
		{
			requestSubject.Sex = 'All';
		}

		if(requestSubject.Diagnosis == undefined)
		{
			requestSubject.Diagnosis = 'All';
		}
		
		if(requestSubject.Handedness == undefined)
		{
			requestSubject.Handedness = 'All';
		}

		if(requestSubject.Projects == undefined)
		{
			requestSubject.Projects = 'All';
		}

		$scope.requestID = requestSubject;

		$state.go('searchResult-SubjectInfo', {Sex: requestSubject.Sex}, {Handedness:requestSubject.Handedness},
			{Diagnosis:requestSubject.Diagnosis},{Projects:requestSubject.Projects});

		$http.get('/raw/subjectInfo/' + requestSubject.Sex +'/' + requestSubject.Handedness +'/' 
			+ requestSubject.Diagnosis +'/' + requestSubject.Projects)
		.then(function(response){
			if(response.data == "no match!" ){
				$scope.subjects = [];
			}
			else{
				$scope.subjects = response.data;
			}
			
		});
	}

	var selectedSubject = [];

	$scope.getSelectedSubjects = function(subject){

		if (subject.selected == true)
		{
			selectedSubject.push(subject);
		}
		else
		{
			var index = selectedSubject.indexOf(subject);
			if(index > -1){
				selectedSubject.splice(index, 1);
			}
		}
		var tobeExported = formatToExcel_Subjects(selectedSubject);
		$scope.getArray = tobeExported;
	}


	$scope.selectAll = function(subjects){
		selectedSubject = [];
		for (var num in subjects)
		{
			subjects[num].selected = true;
			selectedSubject.push(subjects[num]);
		}
		var tobeExported = formatToExcel_Subjects(selectedSubject);
		$scope.getArray = tobeExported;
	}

	$scope.deselectAll = function(subjects){
		selectedSubject = [];
		for (var num in subjects)
		{
			subjects[num].selected = false;
		}
		var tobeExported = [];
		$scope.getArray = tobeExported;
	}

	$scope.getHeader = function(){
		return ['Subject ID',
			'Sex',
			'Date of Birth',
			'Diagnosis',
			'Projects(-ID)',
			'Handedness',
			'Contact for future studies',
			'Comment'];
	}

}]);

//=============================== Projects ==============================

myApp.controller('searchProjectController', ['$state', '$scope', '$http', '$location', '$stateParams', function($state, $scope, $http, $location, $stateParams){

	$scope.getProjects = function(){
		$http.get('/raw/projects').success(function(response){
			$scope.projects = response;
		});
	}

	$scope.searchProjectsByID = function(){
		var requestProjectID = $location.search();
		$scope.requestID = requestProjectID.ProjectID;

		$state.go('searchResult-ProjectID', {ProjectID: requestProjectID.ProjectID});
		$http.get('raw/searchprojectid/' + requestProjectID.ProjectID)
		.then(function(response){
			if (response.data == "no match!")
			{
				$scope.projects = [];
			}
			else
			{
				$scope.projects = response.data;
			}
		});
	}

	$scope.searchProjectsByName = function(){
		var requestProjectID = $location.search();
		$scope.requestID = requestProjectID.ProjectName;

		$state.go('searchResult-ProjectName', {ProjectName: requestProjectID.ProjectName});

		$http.get('raw/searchprojectnames/' + requestProjectID.ProjectName)
		.then(function(response){

			if (response.data == "no match!")
			{
				$scope.projects = [];
			}
			else
			{
				$scope.projects = response.data;
			}
			
		});
	}


	var selectedProject = [];

	$scope.getSelectedProjects = function(project){

		if (project.selected == true)
		{
			selectedProject.push(project);
		}
		else
		{
			var index = selectedProject.indexOf(project);
			if(index > -1){
				selectedProject.splice(index, 1);
			}
		}
		var tobeExported = formatToExcel_Projects(selectedProject);
		$scope.getArray = tobeExported;
	}


	$scope.selectAll = function(projects){
		selectedProject = [];
		for (var num in projects)
		{
			projects[num].selected = true;
			selectedProject.push(projects[num]);
		}
		var tobeExported = formatToExcel_Projects(selectedProject);
		$scope.getArray = tobeExported;
	}

	$scope.deselectAll = function(projects){
		selectedProject = [];
		for (var num in projects)
		{
			projects[num].selected = false;
		}
		var tobeExported = [];
		$scope.getArray = tobeExported;
	}

	$scope.getHeader = function(){
		return ['Project ID',
			'Project Name',
			'Number of Subjects Enrolled',
			'Subjects Enrolled'
			];
	}

}]);




//=============================== Scan Sessions ==============================

myApp.controller('searchScanGIDController', ['$state', '$scope', '$http', '$location', '$stateParams', function($state, $scope, $http, $location, $stateParams){


	$scope.getScanSessionByGID = function(){

		var requestSubjectID = $location.search();
		$scope.requestID = requestSubjectID;

		$state.go('searchResult-ScanGID', {GlobalID: requestSubjectID.GlobalID});

		$http.get('raw/FindScanSessionsGID/'+ requestSubjectID.GlobalID)
		.then(function(response){
			if(response.data == null){
				$scope.scanSessions = "NO MATCH";
			}
			else{
				$scope.scanSessions = response.data;
			}
		});

	}
	

	var selectedScanSession = [];
	$scope.exportData = function(scanSessions){

		for (var num in scanSessions)
		{
			if (scanSessions[num].selected == true)
			{
				selectedScanSession.push(scanSessions[num]);
			}
			else
			{
				var index = selectedScanSession.indexOf(scanSessions[num]);
				if(index > -1){
					selectedScanSession.splice(index, 1);
				}
			}
		}

		var tobeExported = formatToExcel_ScanSessions(selectedScanSession);
		console.log(tobeExported);
		
		alasql('SELECT * INTO XLSX("scans_subjectID.xlsx",{headers:true}) FROM ?', [tobeExported]);
	}


	$scope.selectAll = function(sessions){
		selectedScanSession = [];
		for (var num in sessions)
		{
			sessions[num].selected = true;
			//selectedScanSession.push(sessions[num]);
		}
		//var tobeExported = formatToExcel_ScanSessions(selectedScanSession);
		//$scope.getArray = tobeExported;
	}

	$scope.deselectAll = function(sessions){
		selectedScanSession = [];
		for (var num in sessions)
		{
			sessions[num].selected = false;
		}
		var tobeExported = [];
		//$scope.getArray = tobeExported;
	}


	// $scope.getSelectedScanSession = function(session){

	// 	// 	if (session.selected == true)
	// 	// 	{
	// 	// 		selectedScanSession.push(session);
	// 	// 	}
	// 	// 	else
	// 	// 	{
	// 	// 		var index = selectedScanSession.indexOf(session);
	// 	// 		if(index > -1){
	// 	// 			selectedScanSession.splice(index, 1);
	// 	// 		}
	// 	// 	}
	// 	// 	var tobeExported = formatToExcel_Scans(selectedScanSession);
	// 	// 	$scope.getArray = tobeExported;
	// 	// }
	// $scope.getHeader = function(){
	// 	return [
	// 		'Subject ID (Global)',
	// 		'Session ID',
	// 		'MEGScans',
	// 		'MRIScans',
	// 		'Clinical Tests Done'
	// 		];
	// }

	//=============================== Other stuff ================================
   	$scope.sortColumn= "";
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
	
}]);

myApp.controller('searchScanPIDController', ['$state', '$scope', '$http', '$location', '$stateParams', function($state, $scope, $http, $location, $stateParams){


	$scope.getScanSessionByPID = function(){

		var requestSubjectID = $location.search();
		$scope.requestID = requestSubjectID;

		$state.go('searchResult-ScanPID', {inProjectID: requestSubjectID.inProjectID});

		$http.get('raw/FindScanSessionsPID/'+ requestSubjectID.inProjectID)
		.then(function(response){
			if(response.data == null){
				$scope.scanSessions = "NO MATCH";
			}
			else{
				$scope.scanSessions = response.data;
			}
		});

	}


	var selectedScanSession = [];
	$scope.exportData = function(scanSessions){

		for (var num in scanSessions)
		{
			if (scanSessions[num].selected == true)
			{
				selectedScanSession.push(scanSessions[num]);
			}
			else
			{
				var index = selectedScanSession.indexOf(scanSessions[num]);
				if(index > -1){
					selectedScanSession.splice(index, 1);
				}
			}
		}

		var tobeExported = formatToExcel_ScanSessions(selectedScanSession);
		console.log(tobeExported);
		
		alasql('SELECT * INTO XLSX("scans_inprojectID.xlsx",{headers:true}) FROM ?', [tobeExported]);
	}


	$scope.selectAll = function(sessions){
		selectedScanSession = [];
		for (var num in sessions)
		{
			sessions[num].selected = true;
			//selectedScanSession.push(sessions[num]);
		}
		//var tobeExported = formatToExcel_ScanSessions(selectedScanSession);
		//$scope.getArray = tobeExported;
	}

	$scope.deselectAll = function(sessions){
		selectedScanSession = [];
		for (var num in sessions)
		{
			sessions[num].selected = false;
		}
		var tobeExported = [];
		//$scope.getArray = tobeExported;
	}

	//=============================== Other stuff ================================


   	$scope.sortColumn= "";
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
	
}]);

myApp.controller('searchScanSessionIDController', ['$state', '$scope', '$http', '$location', '$stateParams', function($state, $scope, $http, $location, $stateParams){

	$scope.ageRange = {min:0, max:100};

	$scope.getScanSessionByInfo = function(){

		var requestScan = $location.search();

		if(requestScan.SessionID == undefined || requestScan.SessionID == ''){
			requestScan.SessionID = 'All';}


	

		$scope.requestID = requestScan;

		$state.go('searchResult-ScanSessionID', {SessionID: requestScan.SessionID});

		$http.get('raw/FindScanSessionsSessionID/'+ requestScan.SessionID)

		.then(function(response){
			$scope.what = response.data;
			if(response.data == "no match!"){
				$scope.scanSessions = [];
			}
			else{
				$scope.scanSessions = response.data;
			}
		});

	}


	var selectedScanSession = [];
	$scope.exportData = function(scanSessions){

		for (var num in scanSessions)
		{
			if (scanSessions[num].selected == true)
			{
				selectedScanSession.push(scanSessions[num]);
			}
			else
			{
				var index = selectedScanSession.indexOf(scanSessions[num]);
				if(index > -1){
					selectedScanSession.splice(index, 1);
				}
			}
		}

		var tobeExported = formatToExcel_ScanSessions(selectedScanSession);
		console.log(tobeExported);
		
		alasql('SELECT * INTO XLSX("scans_sessionID.xlsx",{headers:true}) FROM ?', [tobeExported]);
	}


	$scope.selectAll = function(sessions){
		selectedScanSession = [];
		for (var num in sessions)
		{
			sessions[num].selected = true;
			//selectedScanSession.push(sessions[num]);
		}
		//var tobeExported = formatToExcel_ScanSessions(selectedScanSession);
		//$scope.getArray = tobeExported;
	}

	$scope.deselectAll = function(sessions){
		selectedScanSession = [];
		for (var num in sessions)
		{
			sessions[num].selected = false;
		}
		var tobeExported = [];
		//$scope.getArray = tobeExported;
	}


	//=============================== Other stuff ================================


   	$scope.sortColumn= "";
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
	
}]);


myApp.controller('searchScanInfoController', ['$state', '$scope', '$http', '$location', '$stateParams', function($state, $scope, $http, $location, $stateParams){

	$scope.requestID = $location.search();

	$scope.getScanSessionsByInfo = function(){

		var requestScan = $location.search();

		if(requestScan.minAge == undefined){
			requestScan.minAge = '0';}

		if(requestScan.maxAge == undefined){
			requestScan.maxAge = '100';}

		var ageRange = [requestScan.minAge, requestScan.maxAge];
	

		$scope.requestID = requestScan;

		$state.go('searchResult-ScanInfo', {'minAge': requestScan.minAge, 'maxAge':requestScan.maxAge,
		'Allowed': requestScan.Allowed, 'MEGType': requestScan.MEGType, 'MRIType': requestScan.MRIType, 
		'Projects':requestScan.Projects,'SubjectGID': requestScan.SubjectGID, 'SubjectPID': requestScan.SubjectPID});

		$http.get('raw/FindScanSessionsInfo/'+ ageRange 
			+ '/' + requestScan.Allowed 
			+ '/' + requestScan.MEGType
			+ '/' + requestScan.MRIType
			+ '/' + requestScan.Projects
			+ '/' + requestScan.SubjectGID
			+ '/' + requestScan.SubjectPID)

		.then(function(response){
			$scope.what = response.data;
			if(response.data == "no match!"){
				$scope.scanSessions = [];
			}
			else{
				$scope.scanSessions = response.data;
			}
		});

	}

	var selectedScanSession = [];
	$scope.exportData = function(scanSessions){

		for (var num in scanSessions)
		{
			if (scanSessions[num].selected == true)
			{
				selectedScanSession.push(scanSessions[num]);
			}
			else
			{
				var index = selectedScanSession.indexOf(scanSessions[num]);
				if(index > -1){
					selectedScanSession.splice(index, 1);
				}
			}
		}

		var tobeExported = formatToExcel_ScanSessionsInfo(selectedScanSession);
		console.log(tobeExported);
		
		alasql('SELECT * INTO XLSX("scans_scanInfo.xlsx",{headers:true}) FROM ?', [tobeExported]);
	}


	$scope.selectAll = function(sessions){
		selectedScanSession = [];
		for (var num in sessions)
		{
			sessions[num].selected = true;
			//selectedScanSession.push(sessions[num]);
		}
		//var tobeExported = formatToExcel_ScanSessions(selectedScanSession);
		//$scope.getArray = tobeExported;
	}

	$scope.deselectAll = function(sessions){
		selectedScanSession = [];
		for (var num in sessions)
		{
			sessions[num].selected = false;
		}
		var tobeExported = [];
		//$scope.getArray = tobeExported;
	}


	//=============================== Other stuff ================================


   	$scope.sortColumn= "";
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
	
}]);


function formatToExcel_Subjects (selectedSubject) {
	var tobeExported = [];
	for (var num in selectedSubject)
	{
		console.log(selectedSubject[num]);
		var projects = selectedSubject[num].Projects;
		var cleanerproject = [];

		for (var i in projects)
		{
			var newString = projects[i].ProjectID + ' - ' + projects[i].SubjectIDinProject;
			cleanerproject.push(newString);
		}
		var projectString = cleanerproject.toString();
		var cleanerDOB = selectedSubject[num].DateOfBirth.split("T");

		var subject = {
			'Subject ID': selectedSubject[num].ID,
			'Sex':selectedSubject[num].Sex,
			'Date of Birth':cleanerDOB[0],
			'Diagnosis':selectedSubject[num].Diagnosis,
			'Projects(-ID)':projectString,
			'Handedness':selectedSubject[num].Handedness,
			'MRN': selectedSubject[num].MRN,
			'Contact for future studies': selectedSubject[num].ContactPermit,
			'Comment':selectedSubject[num].Other
		}
		tobeExported.push(subject);
	}
	return tobeExported;
}

function formatToExcel_Projects (selectedProject) {
	var tobeExported = [];
	for (var num in selectedProject)
	{
		console.log(selectedProject[num]);
		var subjects = selectedProject[num].SubjectsID;
		var cleanersubject = [];

		for (var i in subjects)
		{
			var newString = subjects[i].GlobalID + ' - ' + subjects[i].inProjectID;
			cleanersubject.push(newString);
		}
		var subjectString = cleanersubject.toString();

		var project = {
			'Project ID':selectedProject[num].ProjectID,
			'Project Name':selectedProject[num].ProjectName,
			'Number of Subjects Enrolled':subjects.length,
			'Subjects Enrolled':subjectString
		}
		tobeExported.push(project);
	}
	return tobeExported;
}

function formatToExcel_Scans (selectedScanSession) {
	var tobeExported = [];
	for (var num in selectedScanSession)
	{
		console.log(selectedScanSession[num]);
		var MEGs = selectedScanSession[num].ScanSessions.MEGScans;
		var MRIs = selectedScanSession[num].ScanSessions.MRIScans;
		var Tests = selectedScanSession[num].ScanSessions.TestResults;
		var cleanerMEGs = [];
		var cleanerMRIs = [];
		var cleanerTests = [];



		for (var i in MEGs)
		{
			var newString = MEGs[i].ScanName + ' - ' + MEGs[i].ScanType;
			cleanerMEGs.push(newString);
		}

		for (var j in MRIs)
		{
			var newString = MRIs[j].ScanName + ' - ' + MRIs[j].ScanType;
			cleanerMRIs.push(newString);
		}

		for (var k in Tests)
		{
			var newString = Tests[k].Type;
			cleanerTests.push(newString);
		}
		var MRIString = cleanerMRIs.toString();
		var MEGString = cleanerMEGs.toString();
		var TestString = cleanerTests.toString();

		console.log(MEGString, MRIString, TestString);

		var scanSession = {
			'Subject ID (Global)': selectedScanSession[num].SubjectID,
			'Session ID': selectedScanSession[num].ScanSessions.SessionID,
			'MEGScans': MEGString,
			'MRIScans': MRIString,
			'Clinical Tests Done': TestString
		}
		tobeExported.push(scanSession);
	}
	return tobeExported;
}

function formatToExcel_ScanSessions (selectedScanSession) {

	console.log(selectedScanSession);
	var tobeExported = [];
	for (var num in selectedScanSession)
	{
		
		var MEGs = selectedScanSession[num].ScanSessions.MEGScans;
		var MRIs = selectedScanSession[num].ScanSessions.MRIScans;
		var Tests = selectedScanSession[num].ScanSessions.TestResults;

		var columnNum = Math.max(MEGs.length, MRIs.length, Tests.length);

		
		for (var i = 0; i < columnNum; i++)
		{
			var scanSession = {
				'SUBJECT ID': selectedScanSession[num].SubjectID,
				'SESSION ID': selectedScanSession[num].ScanSessions.SessionID,
				'IN PROJECT': selectedScanSession[num].relatedProject + "/" + selectedScanSession[num].SubjectIDinProject
			}

			if (MEGs.length <= i )
			{
				scanSession.MEG_Name = '-';
				scanSession.MEG_Date = '-';
				scanSession.MEG_Type = '-';
				scanSession.MEG_Path = '-';
				scanSession.MEG_AgeAtScan = '-';
				scanSession.MEG_Approved = '-';
				scanSession.MEG_Comment = '-';
			}

			else if (MEGs.length > i)
			{
				scanSession.MEG_Name = MEGs[i].ScanName;
				var scanDate = MEGs[i].ScanDate.split("T");
				scanSession.MEG_Date = scanDate[0];
				scanSession.MEG_Type = MEGs[i].ScanType;
				scanSession.MEG_Path = MEGs[i].ScanPath;
				scanSession.MEG_AgeAtScan = MEGs[i].AgeAtScan;
				scanSession.MEG_Approved = MEGs[i].Allowed;
				scanSession.MEG_Comment = MEGs[i].Comment;
			}

			if (MRIs.length <= i )
			{
				scanSession.MRI_Name = '-';
				scanSession.MRI_Date = '-';
				scanSession.MRI_Type = '-';
				scanSession.MRI_Path = '-';
				scanSession.MRI_AgeAtScan = '-';
				scanSession.MRI_Approved = '-';
				scanSession.MRI_Comment = '-';
			}

			else if (MRIs.length > i)
			{
				scanSession.MRI_Name = MRIs[i].ScanName;
				var scanDate = MRIs[i].ScanDate.split("T");
				scanSession.MRI_Date = scanDate[0];
				scanSession.MRI_Type = MRIs[i].ScanType;
				scanSession.MRI_Path = MRIs[i].ScanPath;
				scanSession.MRI_AgeAtScan = MRIs[i].AgeAtScan;
				scanSession.MRI_Approved = MRIs[i].Allowed;
				scanSession.MRI_Comment = MRIs[i].Comment;
			}

			if (Tests.length <= i )
			{
				scanSession.TEST_Type = '-';
				scanSession.TEST_Result = '-';
				scanSession.TEST_Date = '-';
				scanSession.TEST_AgeAtScan = '-';
				scanSession.TEST_Comment = '-';
			}

			else if (Tests.length > i)
			{
				scanSession.TEST_Type = Tests[i].Type;
				scanSession.TEST_Result = Tests[i].Result;
				if (Tests[i].TestDate != undefined)
				{
					var testDate = Tests[i].TestDate.split("T");
					scanSession.TEST_Date = testDate[0];
				}
				else
				{
					scanSession.TEST_Date = Tests[i].TestDate;
				}
				
				scanSession.TEST_AgeAtTest = Tests[i].Age;
				scanSession.TEST_Comment = Tests[i].Comment;
			}
			tobeExported.push(scanSession);
		}

	}

	console.log(tobeExported);
	return tobeExported;
}

function formatToExcel_ScanSessionsInfo (selectedScanSession) {

	console.log(selectedScanSession);
	var tobeExported = [];
	for (var num in selectedScanSession)
	{
		
		var MEGs = selectedScanSession[num].MEGScans;
		var MRIs = selectedScanSession[num].MRIScans;
		var Tests = selectedScanSession[num].TestResults;

		var columnNum = Math.max(MEGs.length, MRIs.length, Tests.length);

		
		for (var i = 0; i < columnNum; i++)
		{
			var scanSession = {
				'SUBJECT ID': selectedScanSession[num]._id.SubjectID,
				'SESSION ID': selectedScanSession[num]._id.SessionID,
				'IN PROJECT': selectedScanSession[num]._id.relatedProject + "/" + selectedScanSession[num]._id.SubjectIDinProject
			}

			if (MEGs.length <= i )
			{
				scanSession.MEG_Name = '-';
				scanSession.MEG_Date = '-';
				scanSession.MEG_Type = '-';
				scanSession.MEG_Path = '-';
				scanSession.MEG_AgeAtScan = '-';
				scanSession.MEG_Approved = '-';
				scanSession.MEG_Comment = '-';
			}

			else if (MEGs.length > i)
			{
				scanSession.MEG_Name = MEGs[i].ScanName;
				var scanDate = MEGs[i].ScanDate.split("T");
				scanSession.MEG_Date = scanDate[0];
				scanSession.MEG_Type = MEGs[i].ScanType;
				scanSession.MEG_Path = MEGs[i].ScanPath;
				scanSession.MEG_AgeAtScan = MEGs[i].AgeAtScan;
				scanSession.MEG_Approved = MEGs[i].Allowed;
				scanSession.MEG_Comment = MEGs[i].Comment;
			}

			if (MRIs.length <= i )
			{
				scanSession.MRI_Name = '-';
				scanSession.MRI_Date = '-';
				scanSession.MRI_Type = '-';
				scanSession.MRI_Path = '-';
				scanSession.MRI_AgeAtScan = '-';
				scanSession.MRI_Approved = '-';
				scanSession.MRI_Comment = '-';
			}

			else if (MRIs.length > i)
			{
				scanSession.MRI_Name = MRIs[i].ScanName;
				var scanDate = MRIs[i].ScanDate.split("T");
				scanSession.MRI_Date = scanDate[0];
				scanSession.MRI_Type = MRIs[i].ScanType;
				scanSession.MRI_Path = MRIs[i].ScanPath;
				scanSession.MRI_AgeAtScan = MRIs[i].AgeAtScan;
				scanSession.MRI_Approved = MRIs[i].Allowed;
				scanSession.MRI_Comment = MRIs[i].Comment;
			}

			if (Tests.length <= i )
			{
				scanSession.TEST_Type = '-';
				scanSession.TEST_Result = '-';
				scanSession.TEST_Date = '-';
				scanSession.TEST_AgeAtScan = '-';
				scanSession.TEST_Comment = '-';
			}

			else if (Tests.length > i)
			{
				scanSession.TEST_Type = Tests[i].Type;
				scanSession.TEST_Result = Tests[i].Result;
				if (Tests[i].TestDate != undefined)
				{
					var testDate = Tests[i].TestDate.split("T");
					scanSession.TEST_Date = testDate[0];
				}
				else
				{
					scanSession.TEST_Date = Tests[i].TestDate;
				}
				
				scanSession.TEST_AgeAtTest = Tests[i].Age;
				scanSession.TEST_Comment = Tests[i].Comment;
			}
			tobeExported.push(scanSession);
		}

	}

	console.log(tobeExported);
	return tobeExported;
}