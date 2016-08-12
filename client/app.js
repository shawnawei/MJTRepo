var myApp = angular.module('myApp', 
	['ui.router', 'LocalStorageModule', 'ngSanitize','ngCsv', 'ngMessages',
	'angularjs-dropdown-multiselect','720kb.datepicker', 'datetime', 'ui.bootstrap']);

myApp.controller('mainCtrl',  [ '$scope', '$http', '$location','localStorageService', 'authenFact',
 function ($scope, $http, $location, localStorageService, authenFact){
 	console.log('main controller loaded');

	if (!authenFact.getAccessToken())
	{
		$scope.loggedin = false;
	}
	else{
		$scope.loggedin = true;
	}

 }]);


myApp.config(function($stateProvider, $urlRouterProvider, 
	$urlMatcherFactoryProvider, $locationProvider){


	$locationProvider.html5Mode(true);
	$urlMatcherFactoryProvider.caseInsensitive(true);
	$stateProvider

	.state("login", {
		url:"/login",
		controller:'authenController',
		templateUrl:'views/login/login.html'
		
	})

	.state("home", {
		url:"/home",
		controller:'homeController',
		templateUrl:'views/home.html',
		authenticated: true
	})

//============================ Subjects ============================

	.state('subjects', {
		url:"/subjects",
		controller:'subjectsController',
		templateUrl:'views/subject/subjects.html'
	})

	.state("subjectDetail", {
		url:'/subjects/:ID',
		controller:'subjectsController',
		templateUrl:'views/subject/subject_details.html'
	})

	.state( "addSubject", {
		url:'/subject/add',
		controller:'addSubjectController',
		templateUrl:'views/subject/add_subject.html'
	})

	.state("editSubject", {
		url:'/subjects/:ID/edit',
		controller:'subjectsController',
		templateUrl:'views/subject/edit_subject.html'
	})

//=========================== Projects ===========================

	.state('projects', {
		url: '/projects',
		controller:'projectsController',
		templateUrl:'views/project/projects.html'
	})

	.state("addProject", {
		url: '/project/add',
		controller:'addProjectController',
		templateUrl:'views/project/add_project.html'
	})

	.state("projectDetail", {
		url:'/projects/:ProjectID',
		controller:'projectsController',
		templateUrl:'views/project/project_details.html'
	})

	.state("editProject", {
		url:'/projects/:ProjectID/edit',
		controller:'projectsController',
		templateUrl:'views/project/edit_project.html'
	})

//========================= Scan Sessions =========================

	.state("scanDetails" ,{
		url:'/ScanInfo/:ProjectID/:SubjectIDinProject',
		controller:'scanSessionsController',
		templateUrl:'views/scansession/scanSessionPage.html'
	})

	.state("editScan" ,{
		url: '/ScanInfo/:ProjectID/:SubjectIDinProject/:SessionID/edit',
		controller:'scanSessionsController',
		templateUrl:'views/scansession/edit_scanSession.html'
	})

	.state( "addScan", {
		url:'/ScanInfo/:ProjectID/:SubjectIDinProject/add',
		controller:'addScanSessionController',
		templateUrl:'views/scansession/add_scanSession.html'
	})

//============================ Search ==============================

	.state('search', {
		url:'/searchPage',
		controller:'searchController',
		templateUrl:'views/search/searchPage.html'
	})

	.state("searchResult-GlobalID", {
		url:'/searchResult-GlobalID?GlobalID',
		controller:'searchSubjectIDController',
		templateUrl:'views/search/searchResult-subGID.html'
	})
	.state("searchResult-inProjectID",{
		url:'/searchResult-inProjectID?inProjectID',
		controller:'searchInProjectIDController',
		templateUrl:'views/search/searchResult-subPID.html'
	})
	.state("searchResult-SubjectInfo", {
		url:'/searchResult-SubjectInfo?Sex&Handedness&Diagnosis&Contact&Age&MRN$FirstName&LastName&Projects',
		controller:'searchSubjectInfoController',
		templateUrl:'views/search/searchResult-subInfo.html'
	})

	.state("searchResult-ProjectID", {
		url:'/searchResult-ProjectID?ProjectID',
		controller:'searchProjectController',
		templateUrl:'views/search/searchResult-ProjectID.html'
	})

	.state("searchResult-ProjectName", {
		url:'/searchResult-ProjectName?ProjectName',
		controller:'searchProjectController',
		templateUrl:'views/search/searchResult-ProjectName.html'
	})

	.state("searchResult-ScanGID", {
		url:'/searchResult-ScanGID?GlobalID:',
		controller:'searchScanGIDController',
		templateUrl:'views/search/searchResult-scanGID.html'
	})

	.state("searchResult-ScanPID", {
		url:'/searchResult-ScanPID?inProjectID',
		controller:'searchScanPIDController',
		templateUrl:'views/search/searchResult-scanPID.html'
	})

	.state("searchResult-ScanSessionID", {
		url:'/searchResult-ScanSessionID?SessionID',
		controller:'searchScanSessionIDController',
		templateUrl:'views/search/searchResult-scanSessionID.html'
	})

	.state("searchResult-ScanInfo", {
		url:'/searchResult-ScanInfo?minAge&maxAge&Allowed&MEGType&MRIType'+
		'&testType&Projects&SubjectGID&SubjectPID',
		controller:'searchScanInfoController',
		templateUrl:'views/search/searchResult-scanInfo.html'
	})

//============================ Admin Options ==============================
	
	.state("adminTestScanType", {
		url:'/admin/edit_test_types',
		controller:'adminController',
		templateUrl:'views/adminOptions/edit_test_types.html'
	})

	.state("adminManageUser", {
		url:'/admin/manage_user',
		controller:'adminController',
		templateUrl:'views/adminOptions/manage_users.html'
	})

	.state("convertojson", {
		url:'/admin/converttojson',
		controller:'adminController',
		templateUrl:'views/adminOptions/converttojson.html'
	})

//========================= Changelog ==================================

	.state("Changelog", {
		url: '/changelog/:doctype',
		controller:'changelogController',
		templateUrl: 'views/changelog/changelog.html'
	})

	.state("ChangelogScans", {
		url: '/changelogscans/:docID',
		controller:'changelogController',
		templateUrl: 'views/changelog/changelogscans.html'
	})

	$urlRouterProvider.otherwise("/home");

});


myApp.directive("fileread", [function () {
    return {
        scope: {
            fileread: "="
        },
        link: function (scope, element, attributes) {
            element.bind("change", function (changeEvent) {
                var reader = new FileReader();
                reader.onload = function (loadEvent) {
                    scope.$apply(function () {
                        scope.fileread = loadEvent.target.result;
                    });
                }
                reader.readAsDataURL(changeEvent.target.files[0]);
            });
        }
    }
}]);

// myApp.run(["$rootScope", "$location", "authenFact", 
// 	function($rootScope, $location, authenFact){

// 		$rootScope.$on('$routeChangeStart', function(event, next, current){
// 			if route is authenticated, then user should access
			
// 			console.log(next);
// 			console.log(current);
// 			if(next.$$route.authenticated){
// 				var userAuthen = authenFact.getAccessToken();
// 				if(!userAuthen){
// 					$location.path('/login');
// 				}
// 			}


// 		});

// }]);


