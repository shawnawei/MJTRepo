//================ backend routing ===================



//var homePage = require('./views/HomePage');
var Promise = require("bluebird");
var express = require('express');
var passport = require('passport');
var router = express.Router();
var subject = require('../models/subjects');
var project = require('../models/projects');
var scanSession = require('../models/scanSessions');
var bodyParser = require('body-parser');
var moment = require('moment');
var Projects = subject.Projects;
var testTypes = require('../models/testTypes');
var MEGTypes = require('../models/MEGTypes');
var MRITypes = require('../models/MRITypes');


//this is to ensure users cannot directly enter following urls
function ensureAuthenticated(req, res, next){

	if (req.isAuthenticated())
	{
		next();
	}
	else
	{
		res.redirect('/login');
	}
};

router.get('/', function(req, res) {
	res.render('./index', {
		isAuthenticated: req.isAuthenticated(),
		user:req.user
	});
});

//=============================== LOGIN/USER AUTHEN =======================

router.post('/raw/login', passport.authenticate('local'), function(req, res){

	console.log(req.body);
	res.json(req.user);
});

router.get('/raw/logOut', ensureAuthenticated, function(req, res){
	req.logout();
	res.redirect('/login');
});


//get subjects list page
router.get('/raw/subjects', ensureAuthenticated, function(req, res) {
	subject.getSubjects().then(function(subjects){
		res.json(subjects);
	});
});

//get projects list page
router.get('/raw/projects', ensureAuthenticated, function(req, res) {
	
	project.getProjects().then(function(projects){
		res.json(projects);
	});
});

//get scan sessions
router.get('/raw/scanSessions', ensureAuthenticated, function(req, res) {

	scanSession.getScanSessions()
	.then(function(scanSessions) {
		res.json(scanSessions);
	});
});



//get individual subject detail page by subjectID
router.get('/raw/subjects/:ID', ensureAuthenticated, function(req, res) {
	subject.getSubjectById(req.params.ID)
	.then(function(subject){
		res.json(subject);
	});

});

//get individual project detail page by projectID
router.get('/raw/projects/:ProjectID', ensureAuthenticated, function(req, res) {

	project.getProjectById(req.params.ProjectID)
	.then(function (project){
		res.json(project);
	});
		
});

//get scan session of a subjects in a project details page (front end: -
// - can be requested from subject details or project details page)
router.get('/raw/scanSession/:ProjectID/:SubjectIDinProject', ensureAuthenticated,
 function(req, res) {

	var projectID = req.params.ProjectID;
	var subjectID = req.params.SubjectIDinProject;
	scanSession.getScanSessionBySubjectIDinProject(projectID, subjectID)
	.then(function(scanSession) {
		res.json(scanSession);
	});
});


router.get('/raw/scanSession/:ProjectID/:SubjectIDinProject/:SessionID', ensureAuthenticated,
 function(req, res) {

	var projectID = req.params.ProjectID;
	var subjectID = req.params.SubjectIDinProject;
	var sessionID = req.params.SessionID;
	scanSession.getScanSessionBySessionID(projectID, subjectID, sessionID)
	.then(function(scanSession) {
		res.json(scanSession);
	})
	.catch(function(err){
		console.log(err);
		res.redirect('raw/scanSession/:ProjectID/:SubjectIDinProject');
	});
});

//add a new subject, also add to projects collection and create scan session
router.post('/raw/subjects', ensureAuthenticated, function(req, res) {
	var _subject = req.body;
	var SubjectProjects = _subject.Projects;
	//create two arrays of same length containing projectIDs and SubjectIDs
	var ProjectIDs = SubjectProjects.map(function (a) {return a.ProjectID;});
	var SubjectIDs = SubjectProjects.map(function (a) {return a.SubjectIDinProject;});
	//add the subject
	subject.addSubject(_subject)

	//something wrong with creating this new subject
	.catch (function (err){
		console.log("error with adding a new subject");
		console.log(err);
		if (err != undefined)
		{	
			for (var num in err.errors)
			{
				console.log(num);
				if ((err.errors[num].path == 'ID')){
					console.log("This subject ID already exists, please give a new ID!");
				}
				
				if ((err.errors[num].path == 'SubjectIDinProject'))
				{
					console.log("This subject ("+ err.errors[num].value
					+ ") already exists in the project!");
				}
			}
			
		}
		res.redirect('raw/subjects');
		var err = new Error("cannot add subject");
		return Promise.reject(err);
	})

	//there's nothing wrong with new subject's content
	//proceed to check if it can be added to the projects list
	.then(function(){
		var subjectGlobalID = _subject.ID;
		return project.addSubject(ProjectIDs, SubjectIDs, subjectGlobalID);
	})
	.then(function(){
		console.log("everything's good");
		res.json(subject);
	})

	//something wrong with creating this new subject or adding this new subject to project list 
	.catch(function(err){
		console.log(err);

		//if subject content itself is okay, but cannot be added to project list
		//then delete this subject because it has already been added
		if (err != "Error: cannot add subject")
		{
			subject.deleteSubjectOnly(_subject.ID)
			.then(function(){
				res.redirect('raw/subjects');
				console.log("deleted subject");
			})
			.catch(function(err){
				console.log(err);
				console.log("error with delete");
			});
		}
		
	});
	
});

//add a new project
router.post('/raw/projects', ensureAuthenticated, function(req, res) {
	var _project = req.body;
	console.log(_project);
	project.addProject(_project)

	.catch(function(err){
		console.log(err);
		if (err != undefined)
		{
			for (var num in err.errors)
			{
				if ((err.errors[num].path == 'ProjectID')){
				console.log("This project ID already exists, please give a new ID!");
				}
				if ((err.errors[num].path == 'ProjectName')){
				console.log("This project name already exists, please give a new name!");
				}
			}
		}
		
		//res.sendStatus(404);
		res.redirect('raw/projects');
	})

	.then(function (project){
		res.json(project);
	});
});

//add a new scan session
router.post('/raw/scanSession', ensureAuthenticated, function(req, res) {
	var scan_session = req.body;
	scanSession.addScanSession(scan_session)
	.then(function(session){
		console.log("hi" + session);
		res.json(session);
		return Promise.resolve();
	})
	.catch(function(err){
		console.log(err);
		if(err != undefined)
		{
			for (var num in err.errors)
			{
				if ((err.errors[num].path == 'SessionID')){
					console.log("This session ID already exists, please give a new ID!");
				}
				if (err.errors[num].path == 'SubjectIDinProject'){
					console.log("This SubjectIDinProject already exists!");
				}
			}
		}
		res.redirect('/scanSessions');
	});
});

//add a single scan session
router.post('/raw/scanSession/:ProjectID/:SubjectIDinProject', ensureAuthenticated, function(req,res){
	var projectID = req.params.ProjectID;
	var subjectIDinProject = req.params.SubjectIDinProject;
	//var sessionID = req.params.SessionID;
	var newScanSession = req.body;

	scanSession.findOneAsync({SubjectIDinProject: subjectIDinProject})
	.catch(function(err){
		console.log(err);
		console.log("cannot find this subject ID in the scan session collection");
		return Promise.reject(err);
	})
	.then(function(oldScanSession){
		var subjectGlobalID = oldScanSession.SubjectID;
		var sessionIDs = (oldScanSession.ScanSessions).map(function(a) {return a.SessionID});
		sessionIDs.push(newScanSession.SessionID);
		if (checkIfUniqueArray(sessionIDs) == false)
		{
			console.log("Session ID already exists");
			return Promise.reject();
		}

		if(newScanSession.SessionID == '')
		{
			console.log("Session ID must not be empty");
			return Promise.reject();
		}

		else
		{
			return scanSession.addSingleScanSession(subjectGlobalID, projectID, subjectIDinProject, newScanSession);
		}
		
	})
	.then(function(scanSession){
		res.json(scanSession);
	})
	.catch(function(err){
		console.log(err);
		res.redirect('./scanSession/:ProjectID:SubjectIDinProject');
	});
});


//edit a subject
router.put('/raw/subjects/:ID', ensureAuthenticated, function(req, res) {
	var id = req.params.ID;
	var _subject = req.body;
	var SubjectProjects = _subject.Projects;
	//create two arrays of same length containing projectIDs and SubjectIDs
	var newProjectIDs = SubjectProjects.map(function (a) {return a.ProjectID;});
	var newSubjectIDs = SubjectProjects.map(function (a) {return a.SubjectIDinProject;});
	
	//make an array of object with project and subjectID in it
	var newSubject = [];
	var len = newProjectIDs.length;
	for(var i = 0; i<len; i++)
	{
		newSubject.push({
			projectID: newProjectIDs[i],
			subjectID: newSubjectIDs[i],
			used: false
		});
	}

	subject.getSubjectById(id)
	.then(function(OldSubject) {
		//console.log(OldSubject);
		var oldSubjectProjects = OldSubject.Projects;
		var oldProjectIDs = oldSubjectProjects.map(function(a){return a.ProjectID});
		var oldSubjectIDs = oldSubjectProjects.map(function(a){return a.SubjectIDinProject});
		
		var oldSubject = [];
		var olen = oldProjectIDs.length;
		for(var i = 0; i<olen; i++)
		{
			oldSubject.push({
				projectID: oldProjectIDs[i],
				subjectID: oldSubjectIDs[i],
				used: false
			});
		}

		var updatePackage = {old:[], new:[]};
		
		for(var i = 0; i< oldSubject.length; i++)
		{
			(updatePackage.old).push(oldSubject[i]);
		}
		for(var i = 0; i< newSubject.length; i++)
		{
			(updatePackage.new).push(newSubject[i]);
		}

		console.log(updatePackage);
		return updatePackage;

	}).then(function (value){
		console.log(value);
		//console.log(value.old);

		return subject.updateSubject(id, _subject, value);
	}).catch(function(err){
		console.log("here");
		console.log(err);
		if (err != undefined)
		{
			for (var num in err.errors)
			{
				if ((err.errors[num].path ) == 'ID'){
					console.log("This subject ID already exists, please choose a new ID!");
				}
				if ((err.errors[num].path) != 'ID'){
					console.log("This subject ("+ err.errors[num].value
					+ ") already exists in the project!");
				}
			}
			
		}
		//res.sendStatus(404);
		res.redirect('/subjects');
	})
	.then(function(subject){
		res.json(subject);
	});

});

//edit a project
router.put('/raw/projects/:ProjectID', ensureAuthenticated, function(req, res) {
	var id = req.params.ProjectID;
	var _project = req.body;
	var newSubjectsInProject = _project.SubjectsID;

	project.findOneAsync({ProjectID:id})
	.then(function(theProject){
		var oldSubjectsinProject = theProject.SubjectsID;
		return project.updateProject(id, _project, {});
	})
	.catch(function(err){
		console.log(err);
		if (err != undefined)
		{
			console.log(err.code);
			if ((err.errors['ProjectID']!=undefined) && 
				(err.errors['ProjectID'].path == 'ProjectID')){
				console.log("This project ID already exists, please give a new ID!");
			}
			if ((err.errors['ProjectName']!=undefined) && 
				(err.errors['ProjectName'].path == 'ProjectName')){
				console.log("This project name already exists, please give a new name!");
			}
		}
		
		//res.sendStatus(404);
		//res.redirect('/projects');
		return Promise.reject();
	})
	.then(function(project){
		var subjectIDs = [];
		var inProjectIDs = [];
		var oldSubjectsinProject = project.SubjectsID;
		for (var num in newSubjectsInProject)
		{
			subjectIDs.push(newSubjectsInProject.GlobalID);
			inProjectIDs.push(newSubjectsInProject.inProjectID);
		}
		return subject.updateSubjectFromProject(id, oldSubjectsinProject, newSubjectsInProject);
	})
	.catch(function(err){
		console.log("error updating subjects" + err);
		res.redirect('/projects');
	})
	.then(function (project) {
		res.json(project);
	});

});

//edit a scan session
router.put('/raw/scanSession/:ProjectID/:SubjectIDinProject/:SessionID', ensureAuthenticated, function(req,res){
	var subjectID = req.params.SubjectIDinProject;
	var sessionID = req.params.SessionID;
	var scan_session = req.body;

	scanSession.findOneAsync({SubjectIDinProject: subjectID})
	.catch(function(err){
		console.log("error with finding the subject + " + err);
		return Promise.reject(err);
	})
	.then(function(OldScanSession){
		console.log(scan_session);
		return scanSession.updateSingleScanSession(OldScanSession, subjectID, sessionID, scan_session);
	})
	
	.catch(function(err){
		if (err != undefined && err != "Cannot find session ID")
		{
			for(var num in err.errors)
			{
				if ((err.errors[num]!=undefined) && 
				(err.errors[num].properties.path == 'SessionID')){
				console.log("This Scan Session ID already exists!");
				}
			}			
		}
		
		res.redirect('./scanSession/:SubjectIDinProject');
	})
	.then(function(scanSession){
		//check scan data
		res.json(scanSession);
	});
});
	

//delete a subject
router.delete('/raw/subjects/:ID', function(req, res) {
	var id = req.params.ID;
	var _subject = req.body;
	//alert("are you sure");
	subject.deleteSubject(id)
	.then(function (subject){
		res.json(subject);	
	}).catch(function(err) {
		res.sendStatus(500);
		console.log(err);
	});
});

//delete a project
router.delete('/raw/projects/:ProjectID', ensureAuthenticated, function(req, res) {
	var id = req.params.ProjectID;
	var _project = req.body;
	project.deleteProject(id)
	.then(function (project){
		res.json(project);	
	}).catch(function(err){
		res.sendStatus(500);
		console.log(err);
	});
});

//delete a scan
router.delete('/raw/scanSession/:ProjectID/:SubjectIDinProject/:SessionID', ensureAuthenticated,
 function(req, res) {
	var subject_id = req.params.SubjectIDinProject;
	var scan_id = req.params.SessionID;
	console.log(subject_id, scan_id);

	scanSession.findOneAsync({SubjectIDinProject: subject_id})
	.catch(function(err){
		console.log("err with finding scan + " + err);
		return Promise.reject(err);
	})
	.then(function(oldScanSession){
		var GlobalID = oldScanSession.SubjectID;
		var projectID = oldScanSession.relatedProject;
		console.log(GlobalID, projectID);
		return scanSession.deleteScanSession(GlobalID, projectID, subject_id, scan_id);
	})
	.then(function (scanSession){
		res.redirect('/raw/scanSession/:ProjectID/:SubjectIDinProject');	
	}).catch(function(err){
		res.sendStatus(500);
		console.log(err);
	});
});

//delete entire scan session 
router.delete('/raw/scansession/:ProjectID/:SubjectIDinProject', ensureAuthenticated, function(req,res){
	var subjectID = req.params.SubjectIDinProject;
	scanSession.deleteEntireScanSessionByinProjectID(subjectID)
	.then(function(){
		res.redirect('raw/projects/:ProjectID');
	})
	.catch(function(err){
		console.log(err);
	})
})


//=========================== GET SEARCH RESULTS =================================


//get individual subject detail page by matching subjectID
router.get('/raw/searchsubjects/:ID', ensureAuthenticated, function(req, res) {
	subject.getSubjectsOfMatchingID(req.params.ID)
	.then(function(subjects){
		res.json(subjects);
	});

});

//get individual subject detail page by inProjectID
router.get('/raw/subjectsInProject/:inProjectID', ensureAuthenticated, function(req, res) {
	var inProjectID = req.params.inProjectID;
	scanSession.getScanSessionByMatchingSubjectIDinProject(inProjectID)
	.catch(function(err){
		return Promise.reject(err);
	})
	.then(function(scanSessions){
		var globalID = [];
		for (var num in scanSessions)
		{
			globalID.push(scanSessions[num].SubjectID)
		}
		console.log(globalID);
		return subject.searchSubjectsByID(globalID);
	})
	.then(function(subject){
		res.json(subject);
	})
	.catch(function(err){
		console.log(err);
		if (err == "TypeError: Cannot read property 'SubjectID' of null")
		{
			console.log(inProjectID + " does not exists");
		}
		res.send("no match!");
	});
});

//search subject by demographic information
router.get('/raw/subjectInfo/:Sex/:Handedness/:Diagnosis/:Projects', ensureAuthenticated, function(req, res) {

	var Sex = req.params.Sex;
	var Handedness = req.params.Handedness;
	var Diagnosis = req.params.Diagnosis;
	var Projects = req.params.Projects.split(',');
	console.log(Projects);
	subject.getSubjectsByInfo(Sex, Handedness, Diagnosis, Projects)
	.then(function(subjects) {
		if(subjects == '')
		{
			console.log("no match");
			res.send("no match!");
		}
		else
		{
			res.json(subjects);
		}
		
	})
	.catch(function(err){
		console.log(err);
		res.send("no match!");
	});
});












//search scan session by inproject id
router.get('/raw/FindScanSessionsPID/:SubjectIDinProject', ensureAuthenticated, function(req, res) {

	var subjectID = req.params.SubjectIDinProject;
	scanSession.getScanSessionBySubjectIDinProjectOnly(subjectID)
	.then(function(scanSession) {
		res.json(scanSession);
	});
});

//search all scan sessions done by a specific subject
router.get('/raw/FindScanSessionsGID/:SubjectID', ensureAuthenticated, function(req, res) {

	var subjectID = req.params.SubjectID;
	scanSession.searchScanSessionBySubjectID(subjectID)
	.then(function(scanSessions) {
		res.json(scanSessions);
	});
});

//search scan sessions by detail information
router.get('/raw/FindScanSessionsSessionID/:SessionID', ensureAuthenticated, function(req, res) {

	var SessionID = req.params.SessionID;

	console.log(Projects);
	scanSession.searchScanSessionBySessionID(SessionID)
	.then(function(scanSessions) {
		if(scanSessions == '')
		{
			console.log("no match");
			res.send("no match!");
		}
		else
		{
			res.json(scanSessions);
		}
		
	})
	.catch(function(err){
		console.log(err);
		res.send("no match!");
	});
});


//search scan sessions by detail information
router.get('/raw/FindScanSessionsInfo/:Age/:Allowed/:MEGType/:MRIType/:Projects/:SubjectGID/:SubjectPID'
	, ensureAuthenticated, function(req, res) {

	var AgeRange = req.params.Age.split(',');
	var Allowed = req.params.Allowed;
	var MEGType = req.params.MEGType.split(',');
	var MRIType = req.params.MRIType.split(',');
	var Projects = req.params.Projects.split(',');
	var SubjectGID = req.params.SubjectGID.split(',');
	var SubjectPID = req.params.SubjectPID.split(',');

	var scanInfoObj = {
		AgeRange: AgeRange,
		Allowed: Allowed,
		MEGType: MEGType,
		MRIType: MRIType,
		Projects: Projects,
		SubjectGID: SubjectGID,
		SubjectPID:SubjectPID
	};

	//console.log(scanInfoObj);

	scanSession.searchScanSessionsByInfo(scanInfoObj)
	.then(function(scanSessions) {
		if(scanSessions == '')
		{
			console.log("no match");
			res.send("no match!");
		}
		else
		{
			res.json(scanSessions);
		}
		
	})
	.catch(function(err){
		console.log(err);
		res.send("no match!");
	});
});

























//search all projects that has project name which contains part of user input
router.get('/raw/searchprojectid/:ProjectID', ensureAuthenticated, function(req, res) {

	var ID = req.params.ProjectID;
	project.getProjectsOfMatchingID(ID)
	.then(function(projects) {

		if(projects == '')
		{
			console.log("no match");
			res.send("no match!");
		}
		else
		{
			res.json(projects);
		}
		
	})
	.catch(function(err){
		console.log(err);
		res.send("no match!");
	})
});

//search all projects that has project name which contains part of user input
router.get('/raw/searchprojectnames/:ProjectName', ensureAuthenticated, function(req, res) {

	var nameString = req.params.ProjectName;
	project.getProjectsOfMatchingName(nameString)
	.then(function(projects) {

		if(projects == '')
		{
			console.log("no match");
			res.send("no match!");
		}
		else
		{
			res.json(projects);
		}
		
	})
	.catch(function(err){
		console.log(err);
		res.send("no match!");
	})
});





//=============================== ADMIN OPTIONS =======================

//get test types 
router.get('/raw/testTypes', ensureAuthenticated, function(req, res) {

	testTypes.getTestTypes()
	.then(function(testTypes) {
		res.json(testTypes);
	});
});


//get single test types 
router.get('/raw/testTypes/:Type', ensureAuthenticated, function(req, res) {
	var type = req.params.Type;
	testTypes.getTestTypeByType(type)
	.then(function(testTypes) {
		res.json(testTypes);
	});
});


//edit a test type
router.put('/raw/testTypes/:Type', ensureAuthenticated, function(req, res) {
	var newTestType = req.body;
	var type = req.params.Type;
	//console.log(type, newTestType);
	testTypes.editTestTypeByType(type, newTestType)
	.then(function(testTypes) {
		res.json(testTypes);
	})
	.catch(function(err){
		console.log(err);
	});
});


//add a test type
router.post('/raw/testTypes', ensureAuthenticated, function(req, res) {
	var newTestType = req.body;
	testTypes.addTestType(newTestType)
	.then(function(testType) {
		res.json(testType);
	})
	.catch(function(err){
		console.log(err);
	});
});

//remove a test type
router.delete('/raw/testTypes/:Type', ensureAuthenticated, function(req, res) {
	var type = req.params.Type;
	testTypes.deleteTestTypeByType(type)
	.then(function(){
		res.redirect('raw/testTypes');
	})
	.catch(function(err){
		console.log(err);
	})
});

//get mri types 
router.get('/raw/MRITypes', ensureAuthenticated, function(req, res) {

	MRITypes.getMRIScanTypes()
	.then(function(MRITypes) {
		res.json(MRITypes);
	});
});

//get single mri types 
router.get('/raw/MRITypes/:Type', ensureAuthenticated, function(req, res) {
	var type = req.params.Type;
	MRITypes.getMRIByType(type)
	.then(function(mriType) {
		res.json(mriType);
	});
});


//edit a mri type
router.put('/raw/MRIType/:Type', ensureAuthenticated, function(req, res) {
	var newMRIType = req.body;
	var type = req.params.Type;
	console.log("hi"+newMRIType, type);
	MRITypes.editMRIType(type, newMRIType)
	.then(function(MRIType) {
		res.json(MRIType);
	})
	.catch(function(err){
		console.log(err);
	});
});


//add a mri type
router.post('/raw/MRITypes', ensureAuthenticated, function(req, res) {
	var newMRIType = req.body;
	MRITypes.addMRIType(newMRIType)
	.then(function(MRIType) {
		res.json(MRIType);
	})
	.catch(function(err){
		console.log(err);
	});
});

//remove a mri type
router.delete('/raw/MRITypes/:Type', ensureAuthenticated, function(req, res) {
	var type = req.params.Type;
	MRITypes.deleteMRIType(type)
	.then(function(){
		res.redirect('raw/MRITypes');
	})
	.catch(function(err){
		console.log(err);
	})
});


//get meg types 
router.get('/raw/MEGTypes', ensureAuthenticated, function(req, res) {

	MEGTypes.getMEGScanTypes()
	.then(function(MEGTypes) {
		res.json(MEGTypes);
	});
});


//get single meg types 
router.get('/raw/MEGTypes/:Type', ensureAuthenticated, function(req, res) {
	var type = req.params.Type;
	MEGTypes.getMEGByType(type)
	.then(function(megType) {
		res.json(megType);
	});
});


//edit a meg type
router.put('/raw/MEGType/:Type', ensureAuthenticated, function(req, res) {
	var newMEGType = req.body;
	var type = req.params.Type;
	console.log("hi"+newMEGType, type);
	MEGTypes.editMEGType(type, newMEGType)
	.then(function(MEGType) {
		res.json(MEGType);
	})
	.catch(function(err){
		console.log(err);
	});
});


//add a meg type
router.post('/raw/MEGTypes', ensureAuthenticated, function(req, res) {
	var newMEGType = req.body;
	MEGTypes.addMEGType(newMEGType)
	.then(function(MEGType) {
		res.json(MEGType);
	})
	.catch(function(err){
		console.log(err);
	});
});

//remove a meg type
router.delete('/raw/MEGTypes/:Type', ensureAuthenticated, function(req, res) {
	var type = req.params.Type;
	MEGTypes.deleteMEGType(type)
	.then(function(){
		res.redirect('raw/MEGTypes');
	})
	.catch(function(err){
		console.log(err);
	})
});


module.exports = router;

function checkIfUniqueArray (array){
	return array.length === new Set(array).size;
}