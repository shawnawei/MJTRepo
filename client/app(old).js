var myApp = angular.module('myApp', ['ngRoute']);

myApp.config(function($routeProvider, $locationProvider){


	$routeProvider

	.when('/login', {
		controller:'authenController',
		templateUrl:'views/login/login.html'
		
	})

	.when('/home', {
		
		
		controller:'homeController',
		templateUrl:'views/home.html'
	})

//============================ Subjects ============================

	.when('/subjects', {
		controller:'subjectsController',
		templateUrl:'views/subject/subjects.html'
	})

	.when('/subjects/:ID', {
		controller:'subjectsController',
		templateUrl:'views/subject/subject_details.html'
	})

	.when('/subject/add', {
		controller:'addSubjectController',
		templateUrl:'views/subject/add_subject.html'
	})

	.when('/subjects/:ID/edit', {
		controller:'subjectsController',
		templateUrl:'views/subject/edit_subject.html'
	})

//=========================== Projects ===========================

	.when('/projects', {
		controller:'projectsController',
		templateUrl:'views/project/projects.html'
	})

	.when('/project/add', {
		controller:'addProjectController',
		templateUrl:'views/project/add_project.html'
	})

	.when('/projects/:ProjectID', {
		controller:'projectsController',
		templateUrl:'views/project/project_details.html'
	})

	.when('/projects/:ProjectID/edit', {
		controller:'projectsController',
		templateUrl:'views/project/edit_project.html'
	})

//========================= Scan Sessions =========================

	.when('/ScanInfo/:ProjectID/:SubjectIDinProject', {
		controller:'scanSessionsController',
		templateUrl:'views/scansession/scanSessionPage.html'
	})

	.when('/ScanInfo/:ProjectID/:SubjectIDinProject/:SessionID/edit', {
		controller:'scanSessionsController',
		templateUrl:'views/scansession/edit_scanSession.html'
	})

	.when('/ScanInfo/:ProjectID/:SubjectIDinProject/add', {
		controller:'addScanSessionController',
		templateUrl:'views/scansession/add_scanSession.html'
	})

//============================ Search ==============================

	.when('/searchPage', {
		controller:'searchController',
		templateUrl:'views/search/searchPage.html'
	})

	.when('/searchResult-GlobalID', {
		controller:'searchSubjectIDController',
		templateUrl:'views/search/searchResult-subGID.html'
	})
	.when('/searchResult-inProjectID', {
		controller:'searchInProjectIDController',
		templateUrl:'views/search/searchResult-subPID.html'
	})
	.when('/searchResult-SubjectInfo', {
		controller:'searchSubjectInfoController',
		templateUrl:'views/search/searchResult-subInfo.html'
	})

	.when('/searchResult-ProjectID', {
		controller:'searchProjectController',
		templateUrl:'views/search/searchResult-ProjectID.html'
	})

	.when('/searchResult-ProjectName', {
		controller:'searchProjectController',
		templateUrl:'views/search/searchResult-ProjectName.html'
	})

	.when('/searchResult-ScanGID', {
		controller:'searchScanGIDController',
		templateUrl:'views/search/searchResult-scanGID.html'
	})

	.when('/searchResult-ScanPID', {
		controller:'searchScanPIDController',
		templateUrl:'views/search/searchResult-scanPID.html'
	})

	.when('/searchResult-ScanSessionID', {
		controller:'searchScanSessionIDController',
		templateUrl:'views/search/searchResult-scanSessionID.html'
	})

	.when('/searchResult-ScanInfo', {
		controller:'searchScanInfoController',
		templateUrl:'views/search/searchResult-scanInfo.html'
	})


//============================ Admin Options ==============================
	
	.when('/admin/edit_test_types', {
		controller:'adminController',
		templateUrl:'views/adminOptions/edit_test_types.html'
	})


	.otherwise({
		redirctTo: '/#/home'
	});



});