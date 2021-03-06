//================ backend routing ===================



//var homePage = require('./views/HomePage');
var Promise = require("bluebird");
var path = require('path');
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
var AuthenList = require('../models/authenList');
var xlsxj = require('xlsx-to-json');
var convert = require('xlsx-to-json-plus');
var changelog = require('../models/changelog');



//this is to ensure users cannot directly enter following urls
function ensureAuthenticated(req, res, next){

	if (req.isAuthenticated())
	{
		//console.log(req.user.uid);
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

router.post('/raw/login', passport.authenticate('ldapauth'), function(req, res){

	//console.log(req.body);
	res.json(req.user);
});

router.get('/raw/logOut', ensureAuthenticated, function(req, res){

	req.session.destroy();
	req.logout();
	res.redirect('/login');
});




//============================= GET INFORMATION ==========================

router.get('/raw/subjectnum', ensureAuthenticated, function(req, res){
	subject.getSubjects()
	.then(function(subjects){
		res.json(subjects.length);
	});
});

router.get('/raw/projectnum', ensureAuthenticated, function(req, res){
	project.getProjectNum()
	.then(function(projects){
		res.json(projects.length);
	});
});

router.get('/raw/scannum', ensureAuthenticated, function(req, res){
	scanSession.getAllScanSessions()
	.then(function(scanSessions){
		var oldarray = [];
			scanSessions.map(function(a){
				var session = a.ScanSessions;
				for (var num in session)
				{
					oldarray.push(session[num].SessionID);
				}
			});
				
		res.json(oldarray.length);
	});
});

//get subjects list page
router.get('/raw/subjects', ensureAuthenticated, function(req, res) {

	var uid = req.user.uid;

	var registeredUsers = [];

	AuthenList.getAllUsers()
	.then(function(users){
		for (var num in users)
		{
			registeredUsers.push({uid: users[num].uid, Type:users[num].Type});
		}
	})
	.then(function(){
		var isAdmin = false;
		for (var num in registeredUsers)
		{
			if (registeredUsers[num].uid==uid && registeredUsers[num].Type == 'admin')
			{
				isAdmin = true;
			}
		}
		if(isAdmin)
		{
			return subject.getSubjects();
		}
		else{
			return Promise.resolve([]);
		}
		
	})
	.then(function(subjects){
		if (subject == [] || subject == null)
		{
			res.sendStatus(403)
		}
		else
		{
			res.json(subjects);
		}

	});

});


//get projects list page
router.get('/raw/projects', ensureAuthenticated, function(req, res) {
	
	var uid = req.user.uid;
	project.getProjects(uid)
	.then(function(projects){
		res.json(projects);
	});
});



//get list of project this user can access
router.get('/raw/projects-authen', ensureAuthenticated, function(req, res) {
	
	var uid = req.user.uid;
	project.getAuthenProjects(uid)
	.then(function(projects){
		res.json(projects);
	});
});

//get scan sessions
router.get('/raw/scanSessions', ensureAuthenticated, function(req, res) {

	var uid = req.user.uid;
	scanSession.getScanSessions(uid)
	.then(function(scanSessions) {
		res.json(scanSessions);
	});
});



//get individual subject detail page by subjectID
router.get('/raw/subjects/:ID', ensureAuthenticated, function(req, res) {
	
	var uid = req.user.uid;

	var registeredUsers = [];

	AuthenList.getAllUsers()
	.then(function(users){
		for (var num in users)
		{
			registeredUsers.push({uid: users[num].uid, Type:users[num].Type});
		}
	})
	.then(function(){
		var isAdmin = false;
		for (var num in registeredUsers)
		{
			if (registeredUsers[num].uid==uid && registeredUsers[num].Type == 'admin')
			{
				isAdmin = true;
			}
		}
		if(isAdmin)
		{
			return subject.getSubjectById(req.params.ID, uid);
		}
		else{
			return Promise.resolve('empty');
		}
		
	})
	.then(function(subject){
		if (subject == 'empty')
		{
			res.sendStatus(403)
		}
		else
		{
			res.json(subject);
		}

	});

});


//get individual project detail page by projectID
router.get('/raw/projects/:ProjectID', ensureAuthenticated, function(req, res) {

	var uid = req.user.uid;
	project.getProjectById(req.params.ProjectID, uid)
	.then(function (project){
		res.json(project);
	});
		
});

//get individual project detail page by projectID
router.get('/raw/projectsSubjectInfo/:ProjectID', ensureAuthenticated, function(req, res) {

	var uid = req.user.uid;
	project.getProjectByIdSubjectInfo(req.params.ProjectID, uid)
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
	var uid = req.user.uid;
	scanSession.getScanSessionBySubjectIDinProject(projectID, subjectID, uid)
	.then(function(scanSession) {
		res.json(scanSession[0]);
	});
});


router.get('/raw/scanSession/:ProjectID/:SubjectIDinProject/:SessionID', ensureAuthenticated,
 function(req, res) {

	var projectID = req.params.ProjectID;
	var subjectID = req.params.SubjectIDinProject;
	var sessionID = req.params.SessionID;
	var uid = req.user.uid;
	scanSession.getScanSessionBySessionID(projectID, subjectID, sessionID, uid)
	.then(function(scanSession) {
		res.json(scanSession);
	})
	.catch(function(err){
		console.log(err);
		res.redirect('raw/scanSession/:ProjectID/:SubjectIDinProject');
	});
});






//=============================== ADD INFORMATION ========================

//add a new subject, also add to projects collection and create scan session
router.post('/raw/subjects', ensureAuthenticated, function(req, res) {
	var _subject = req.body;
	var SubjectProjects = _subject.Projects;
	//create two arrays of same length containing projectIDs and SubjectIDs
	var ProjectIDs = SubjectProjects.map(function (a) {return a.ProjectID;});
	var SubjectIDs = SubjectProjects.map(function (a) {return a.SubjectIDinProject;});
	var uid = req.user.uid;

	var registeredUsers = [];

	AuthenList.getAllUsers()
	.then(function(users){
		for (var num in users)
		{
			registeredUsers.push({uid: users[num].uid, Type:users[num].Type});
		}
	})
	.then(function(){
		var isAdmin = false;
		for (var num in registeredUsers)
		{
			if (registeredUsers[num].uid==uid && registeredUsers[num].Type == 'admin')
			{
				isAdmin = true;
			}
		}
		if(isAdmin)
		{
			//add the subject
			return subject.addSubject(_subject);
		}
		else{
			return Promise.resolve('empty');
		}
		
	})
	//something wrong with creating this new subject
	.catch (function (err){
		//console.log(err);
		if (err.errors != undefined)
		{	
			for (var num in err.errors)
			{
				//console.log(num);
				if ((err.errors[num].path == 'ID')){
					//console.log("This subject ID already exists, please give a new ID!");
					var newerr = "Error: This subject ID already exists, please give a new ID!";
				}

				if ((err.errors[num].path == 'MRN')){
					//console.log("This subject ID already exists, please give a new ID!");
					var newerr = "Error: A subject with this MRN already exists!";
				}
				
				if ((err.errors[num].path == 'SubjectIDinProject'))
				{
					//console.log("This subject ("+ err.errors[num].value
					//+ ") already exists in the project!");
					var newerr = "Error: This subject ("+ err.errors[num].value
					+ ") already exists in the project!";
				}
			}
			return Promise.reject(newerr);	
		}
		else
		{
			return Promise.reject(err);	
		}
		
	})

	//there's nothing wrong with new subject's content
	//proceed to check if it can be added to the projects list
	.then(function(subject){
		if (subject == 'empty')
		{
			return Promise.resolve('empty');
		}
		else
		{
			var subjectGlobalID = _subject.ID;
			project.addSubject(ProjectIDs, SubjectIDs, subjectGlobalID);
			return Promise.resolve(subject);
		}
		
	})
	.then(function(subject){
		if (subject == 'empty')
		{
			res.sendStatus(403);
		}
		else
		{
			var changeinfo = {DocType: 'Subjects', ChangeType: 'add', DocID: subject.ID};
			var newDoc = subject;
			var oldDoc = 'addnew';
			var uid = req.user.uid;
			changelog.addChange(uid, oldDoc, newDoc, changeinfo);
			res.json(subject);
		}
		
	})

	//something wrong with creating this new subject or adding this new subject to project list 
	.catch(function(err){
		console.log(err);
		var checkerr = err.split(":");
		//console.log(checkerr);

		//if subject content itself is okay, but cannot be added to project list
		//then delete this subject because it has already been added
		if (checkerr[0] != 'Error')
		{
			subject.deleteSubjectOnly(_subject.ID)
			.then(function(){
				console.log("add new subject error: "+ err);
				res.status(400).send(err);
				//console.log("deleted subject");
			})
			.catch(function(err){
				//console.log(err);
				//console.log("error with delete");
			});
		}
		else
		{
			console.log("add new subject error: "+ err);
			res.status(400).send(err);
		}
		
	});
	
});

//add a new project
router.post('/raw/projects', ensureAuthenticated, function(req, res) {
	var _project = req.body;
	var uid = req.user.uid;
	//console.log(_project);
	project.addProject(_project,uid)
	.then(function (newproject){
		console.log(newproject);
		var changeinfo = {DocType: 'Projects', ChangeType: 'add', DocID: newproject.ProjectID};
		var newDoc = newproject;
		var oldDoc = 'addnew';
		var uid = req.user.uid;
		changelog.addChange(uid, oldDoc, newDoc, changeinfo);
		res.json(newproject);
	})
	.catch(function(err){
		console.log(err);
		if (err.errors != undefined)
		{
			for (var num in err.errors)
			{
				if ((err.errors[num].path == 'ProjectID')){
					//console.log("This project ID already exists, please give a new ID!");
					var err = "This project ID already exists, please give a new ID!";
					return Promise.reject("This project ID already exists, please give a new ID!");
				}
				if ((err.errors[num].path == 'ProjectName')){
					//console.log("This project name already exists, please give a new name!");
					var err = "This project name already exists, please give a new name!";
					return Promise.reject("This project name already exists, please give a new name!");
				}
			}
		}
		
		res.status(400).send(err);
		//res.redirect('raw/projects');
	})
	.catch(function(err){
		console.log("add new project error: " + err);
		res.status(400).send(err);
	})
	
});

//add a new scan session
router.post('/raw/scanSession', ensureAuthenticated, function(req, res) {
	var scan_session = req.body;
	scanSession.addScanSession(scan_session)
	.then(function(session){
		//console.log("hi" + session);
		res.json(session);
		return Promise.resolve();
	})
	.catch(function(err){
		//console.log(err);
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
		console.log("add scan session error: " +err);
		res.status(400).send(err);
	});
});

//add a single scan session
router.post('/raw/scanSession/:ProjectID/:SubjectIDinProject', ensureAuthenticated, function(req,res){
	var projectID = req.params.ProjectID;
	var subjectIDinProject = req.params.SubjectIDinProject;
	var uid = req.user.uid;
	//var sessionID = req.params.SessionID;
	var newScanSession = req.body;

	scanSession.findOneAsync({SubjectIDinProject: subjectIDinProject})
	.catch(function(err){
		//console.log(err);
		//console.log("cannot find this subject ID in the scan session collection");
		return Promise.reject(err);
	})
	.then(function(oldScanSession){
		var subjectGlobalID = oldScanSession.SubjectID;
		var sessionIDs = (oldScanSession.ScanSessions).map(function(a) {return a.SessionID});
		sessionIDs.push(newScanSession.SessionID);
		if (checkIfUniqueArray(sessionIDs) == false)
		{
			//console.log("Session ID already exists");
			return Promise.reject("Session ID already exists");
		}

		if(newScanSession.SessionID == '')
		{
			//console.log("Session ID must not be empty");
			return Promise.reject("Session ID must not be empty");
		}

		else
		{
			return scanSession.addSingleScanSession(oldScanSession, subjectGlobalID, projectID, subjectIDinProject, newScanSession, uid);
		}
		
	})
	.then(function(newandold){
		console.log(newandold);
		var oldDoc = newandold[0];
		var newDoc = newandold[1];
		var changeinfo = {DocType: 'ScanSessions', ChangeType: 'update', DocID: oldDoc.SubjectIDinProject};
		changelog.addChange(uid, oldDoc, newDoc, changeinfo);
		res.json(newDoc);
	})
	.catch(function(err){
		console.log("add scan error: " + err);
		res.status(400).send(err);
	});
});



//============================= EDIT INFORMATION ==============================

//edit a subject
router.put('/raw/subjects/:ID', ensureAuthenticated, function(req, res) {

	var uid = req.user.uid;
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

	var registeredUsers = [];

	AuthenList.getAllUsers()
	.then(function(users){
		for (var num in users)
		{
			registeredUsers.push({uid: users[num].uid, Type:users[num].Type});
		}
	})
	.then(function(){
		var isAdmin = false;
		for (var num in registeredUsers)
		{
			if (registeredUsers[num].uid==uid && registeredUsers[num].Type == 'admin')
			{
				isAdmin = true;
			}
		}
		if(isAdmin)
		{
			return subject.getSubjectById(id);
		}
		else{
			return Promise.resolve('empty');
		}
		
	})
	.then(function(OldSubject) {

		if (OldSubject == 'empty')
		{
			return Promise.resolve('empty');
		}

		else
		{
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

			//console.log(updatePackage);
			subject.updateSubject(id, _subject, updatePackage);
			return Promise.resolve(OldSubject);
		}
		
	})
	.then(function(oldDoc){
		if (oldDoc == 'empty')
		{
			res.sendStatus(403);
		}
		else
		{
			//console.log(oldDoc);
			var newDoc = _subject;
			var changeinfo = {DocType: 'Subjects', ChangeType: 'update', DocID: _subject.ID};
			changelog.addChange(uid, oldDoc, newDoc, changeinfo);
			res.json(newDoc);
		}
	})
	.catch(function(err){
		console.log(err);
		
		if (err.errors == undefined)
		{
			var checkerr = err.split(":");
			//console.log(checkerr);
		}
		
		else if (err.errors != undefined)
		{
			for (var num in err.errors)
			{
				if ((err.errors[num].path ) == 'ID'){
					//console.log("This subject ID already exists, please choose a new ID!");
					err = "This subject ID already exists, please choose a new ID!";
					return Promise.reject(err);
				}
				else if ((err.errors[num].path ) == 'MRN'){
					//console.log("This subject ID already exists, please choose a new ID!");
					err = "A subject with the MRN you entered already exists!";
					return Promise.reject(err);
				}

				else if ((err.errors[num].path) != 'ID' && (err.errors[num].path ) != 'MRN'){
					//console.log("This subject ("+ err.errors[num].value
					//+ ") already exists in the project!");
					err = "This subject ("+ err.errors[num].value
					+ ") already exists in the project!";
					return Promise.reject(err);
				}
			}
		}
		console.log("edit subjec error: " + err);
		res.status(400).send(err);
	})
	.catch(function(err){
		console.log("edit subject error: "+ err);
		res.status(400).send(err);
	});
	

});

//edit a project
router.put('/raw/projects/:ProjectID', ensureAuthenticated, function(req, res) {
	var id = req.params.ProjectID;
	var _project = req.body;
	var newproject = req.body;
	var newSubjectsInProject = _project.SubjectsID;
	var _uid = req.user.uid;

	var testUID = {uid:_uid, ViewOnly:false};
	var allUser = {uid: 'AllUsers', ViewOnly: false};

	var query = {
		ProjectID:id,
		'AccessAuthen': {$elemMatch: {$or:[testUID, allUser]}}
	};

	project.findOneAsync(query)
	.then(function(theProject){
		if (theProject == null)
		{
			return Promise.resolve("empty");
		}
		else
		{
			var oldSubjectsinProject = theProject.SubjectsID;
			project.updateProject(id, _project);
			return Promise.resolve(theProject);
		}
		
	})
	.then(function(project){
		if (project == "empty")
		{
			return Promise.reject("empty");
		}
		else
		{
			var subjectIDs = [];
			var inProjectIDs = [];
			var oldSubjectsinProject = project.SubjectsID;
			for (var num in newSubjectsInProject)
			{
				subjectIDs.push(newSubjectsInProject.GlobalID);
				inProjectIDs.push(newSubjectsInProject.inProjectID);
			}
			subject.updateSubjectFromProject(_project, id, oldSubjectsinProject, newSubjectsInProject);
			return Promise.resolve(project);
		}
		
	})
	.then(function (project) {
		var changeinfo = {DocType: 'Projects', ChangeType: 'update', DocID: project.ProjectID};
		changelog.addChange(_uid, project, newproject, changeinfo);
		res.json(project);
	})
	.catch(function(err){
		//console.log(err);
		if (err.errors != undefined)
		{
			//console.log(err.errors);
			if ((err.errors['ProjectID']!=undefined) && 
				(err.errors['ProjectID'].path == 'ProjectID')){
				//console.log("This project ID already exists, please give a new ID!");
				var newerr = "This project ID already exists, please give a new ID!";
				return Promise.reject(newerr);
			}
			if ((err.errors['ProjectName']!=undefined) && 
				(err.errors['ProjectName'].path == 'ProjectName')){
				//console.log("This project name already exists, please give a new name!");
				var newerr = "This project name already exists, please give a new name!";
				return Promise.reject(newerr);
			}
		}
		
		else
		{
			console.log("edit project error " + err);
			res.status(400).send(err);
		}
		
	})
	.catch(function(err){
		if (err == "empty")
		{
			res.sendStatus(403);
		}
		else
		{
			console.log("edit project error " + err);
			res.status(400).send(err);
		}
		
	});
	

});

//edit a scan session
router.put('/raw/scanSession/:ProjectID/:SubjectIDinProject/:SessionID', ensureAuthenticated, function(req,res){
	var subjectID = req.params.SubjectIDinProject;
	var sessionID = req.params.SessionID;
	var newScanSession = req.body;
	var _uid = req.user.uid;

	var testUID = {uid:_uid, ViewOnly:false};
	var allUser = {uid: 'AllUsers', ViewOnly: false};

	var query = {
		SubjectIDinProject:subjectID,
		'AccessAuthen': {$elemMatch: {$or:[testUID, allUser]}}
	};

	scanSession.findOneAsync(query)
	.then(function(OldScanSession){
		//console.log(OldScanSession);
		if (OldScanSession == null)
		{
			return Promise.resolve("empty");
		}
		else
		{
			//console.log(scan_session);
			return scanSession.updateSingleScanSession(OldScanSession, subjectID, sessionID, 
				newScanSession, _uid);
		}
		
	})

	.then(function(scanSession){
		//check scan data
		if (scanSession == "empty")
		{
			res.sendStatus(403);
		}
		else{
			res.json(scanSession);
		}
		
	})
	.catch(function(err){
		if (err != undefined && err != "Cannot find session ID")
		{
			for(var num in err.errors)
			{
				if ((err.errors[num]!=undefined) && 
				(err.errors[num].properties.path == 'SessionID')){
				//console.log("This Scan Session ID already exists!");
				}
			}			
		}
		
		console.log("error with editing a scan session "+ err);
		res.status(400).send(err);
	});

});




//===================== DELETE INFORMATION ===============================

//delete a subject
router.delete('/raw/subjects/:ID', function(req, res) {
	var id = req.params.ID;
	var _subject = req.body;

	var uid = req.user.uid;
	var registeredUsers = [];

	AuthenList.getAllUsers()
	.then(function(users){
		for (var num in users)
		{
			registeredUsers.push({uid: users[num].uid, Type:users[num].Type});
		}
	})
	.then(function(){
		return subject.getSubjectById(id);
	})
	.then(function(oldsubject){
		var isAdmin = false;
		for (var num in registeredUsers)
		{
			if (registeredUsers[num].uid==uid && registeredUsers[num].Type == 'admin')
			{
				isAdmin = true;
			}
		}
		if(isAdmin)
		{
			subject.deleteSubject(id);
			return Promise.resolve(oldsubject);
		}
		else{
			return Promise.resolve('empty');
		}
		
	})
	.then(function (oldsubject){
		if (oldsubject == 'empty')
		{
			res.sendStatus(403);
		}
		else
		{
			var changeinfo = {DocType: 'Subjects', ChangeType: 'delete', DocID: id};
			var uid = req.user.uid;
			var newDoc = "deleteDoc";
			changelog.addChange(uid, oldsubject, newDoc, changeinfo);
			res.json(subject);
		}
			
	})
	.catch(function(err) {
		res.sendStatus(500);
		console.log(err);
	});
});

//delete a project
router.delete('/raw/projects/:ProjectID', ensureAuthenticated, function(req, res) {
	var id = req.params.ProjectID;
	var _project = req.body;

	var _uid = req.user.uid;
	var testUID = {uid:_uid, ViewOnly:false};
	var allUser = {uid: 'AllUsers', ViewOnly: false};

	var query = {
		ProjectID:id,
		'AccessAuthen': {$elemMatch: {$or:[testUID, allUser]}}
	};

	project.findOneAsync(query)
	.then(function(project){
		if (project == undefined || project == []){
			return Promise.reject("not authorized");
		}
		else{
			return Promise.resolve(project);
		}
	})
	.then(function(oldproject){

		project.deleteProject(id);
		return Promise.resolve(oldproject);
	})	
	.then(function (oldproject){

		var changeinfo = {DocType: 'Projects', ChangeType: 'delete', DocID: id};
		var uid = req.user.uid;
		var newDoc = "deleteDoc";
		changelog.addChange(uid, oldproject, newDoc, changeinfo);

		res.json(oldproject);	
	}).catch(function(err){
		if (err == "not authorized")
		{
			res.sendStatus(403);
		}
		else
		{
			res.sendStatus(500);
			console.log(err);
		}
		
	});
});

//delete a single scan session
router.delete('/raw/scanSession/:ProjectID/:SubjectIDinProject/:SessionID', ensureAuthenticated,
 function(req, res) {
	var subject_id = req.params.SubjectIDinProject;
	var scan_id = req.params.SessionID;
	var uid = req.user.uid;

	scanSession.findOneAsync({SubjectIDinProject: subject_id})
	.catch(function(err){
		console.log("err with finding scan + " + err);
		return Promise.reject(err);
	})
	.then(function(oldScanSession){
		var GlobalID = oldScanSession.SubjectID;
		var projectID = oldScanSession.relatedProject;
		scanSession.deleteScanSession(uid, GlobalID, projectID, subject_id, scan_id);
		return Promise.resolve(oldScanSession);
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
//search subject by global ID feature
router.get('/raw/searchsubjects/:ID', ensureAuthenticated, function(req, res) {
	subject.getSubjectsOfMatchingID(req.params.ID, req.user.uid)
	.then(function(subjects){
		res.json(subjects);
	});

});


//get individual subject detail page by inProjectID
//search subject by in project ID feature
router.get('/raw/subjectsInProject/:inProjectID', ensureAuthenticated, function(req, res) {
	var inProjectID = req.params.inProjectID;
	var uid = req.user.uid;
	scanSession.findSubjectByinProjectID(inProjectID, uid)
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
router.get('/raw/subjectInfo/:Sex/:Handedness/:Diagnosis/:Contact/:Age/:MRN/:FirstName/:LastName/:Projects', ensureAuthenticated, function(req, res) {

	var Sex = req.params.Sex;
	var Handedness = req.params.Handedness;
	var Diagnosis = req.params.Diagnosis;
	var Contact = req.params.Contact;
	var Age = req.params.Age;
	var MRN = req.params.MRN;
	var FirstName = req.params.FirstName;
	var LastName = req.params.LastName;
	var Projects = req.params.Projects.split(',');
	//console.log(Projects);
	subject.getSubjectsByInfo(Sex, Handedness, Diagnosis, Contact, Age, MRN, FirstName, LastName, Projects)
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
	var uid = req.user.uid;
	scanSession.getScanSessionBySubjectIDinProjectOnly(subjectID, uid)
	.then(function(scanSession) {
		res.json(scanSession);
	});
});

//search all scan sessions done by a specific subject
router.get('/raw/FindScanSessionsGID/:SubjectID', ensureAuthenticated, function(req, res) {

	var subjectID = req.params.SubjectID;
	var uid = req.user.uid;
	scanSession.searchScanSessionBySubjectID(subjectID, uid)
	.then(function(scanSessions) {
		res.json(scanSessions);
	});
});

//search scan sessions by detail information
router.get('/raw/FindScanSessionsSessionID/:SessionID', ensureAuthenticated, function(req, res) {

	var SessionID = req.params.SessionID;
	var uid = req.user.uid;

	//console.log(Projects);
	scanSession.searchScanSessionBySessionID(SessionID, uid)
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
router.get('/raw/FindScanSessionsInfo/:Age/:Allowed/:MEGType/:MRIType/:testType/:Projects/:SubjectGID/:SubjectPID'
	, ensureAuthenticated, function(req, res) {

	var AgeRange = req.params.Age.split(',');
	var Allowed = req.params.Allowed;
	var MEGType = req.params.MEGType.split(',');
	var MRIType = req.params.MRIType.split(',');
	var testType = req.params.testType.split(',');
	var Projects = req.params.Projects.split(',');
	var SubjectGID = req.params.SubjectGID.split(',');
	var SubjectPID = req.params.SubjectPID.split(',');
	var uid = req.user.uid;

	var scanInfoObj = {
		AgeRange: AgeRange,
		Allowed: Allowed,
		MEGType: MEGType,
		MRIType: MRIType,
		testType: testType,
		Projects: Projects,
		SubjectGID: SubjectGID,
		SubjectPID:SubjectPID
	};

	//console.log(scanInfoObj);


	scanSession.searchScanSessionsByInfo(scanInfoObj, uid)
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
	var uid = req.user.uid;
	//console.log(type, newTestType);

	testTypes.getTestTypeByType(type)
	.then(function(oldTestType){
		var oldDoc = oldTestType;
		return Promise.resolve(oldDoc);
	})
	.then(function(oldDoc){
		testTypes.editTestTypeByType(type, newTestType);
		return Promise.resolve(oldDoc);
	})
	.then(function(oldDoc){
		console.log(oldDoc);
		var newDoc = newTestType;
		var changeinfo = {DocType: 'TestType', ChangeType: 'update', DocID: newTestType.TestID};
		return changelog.addChange(uid, oldDoc, newDoc, changeinfo);
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
		//res.json(testType);
		return Promise.resolve(testType);
	})
	.then(function(testType){
		//console.log(testType);
		var changeinfo = {DocType: 'TestType', ChangeType: 'add', DocID: newTestType.TestID};
		var newDoc = testType;
		var oldDoc = 'addnew';
		var uid = req.user.uid;
		return changelog.addChange(uid, oldDoc, newDoc, changeinfo);
	})
	.catch(function(err){
		console.log(err);
	});
});

//remove a test type
router.delete('/raw/testTypes/:Type', ensureAuthenticated, function(req, res) {
	var type = req.params.Type;

	testTypes.getTestTypeByType(type)
	.then(function(oldTest){
		var oldDoc = oldTest;
		return Promise.resolve(oldDoc);
	})
	.then(function(oldDoc){
		testTypes.deleteTestTypeByType(type)
		return Promise.resolve(oldDoc);
	})
	.then(function(oldDoc){
		//console.log(oldDoc);
		var changeinfo = {DocType: 'TestType', ChangeType: 'delete', DocID: type};
		var uid = req.user.uid;
		var newDoc = "deleteDoc";
		return changelog.addChange(uid, oldDoc, newDoc, changeinfo);
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
	var uid = req.user.uid;

	MRITypes.getMRIByType(type)
	.then(function(oldMRIType){
		var oldDoc = oldMRIType;
		return Promise.resolve(oldDoc);
	})
	.then(function(oldDoc){
		MRITypes.editMRIType(type, newMRIType);
		return Promise.resolve(oldDoc);
	})
	.then(function(oldDoc){
		var newDoc = newMRIType;
		var changeinfo = {DocType: 'MRIType', ChangeType: 'update', DocID: newMRIType.TypeID};
		return changelog.addChange(uid, oldDoc, newDoc, changeinfo);
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
		//res.json(MRIType);
		return Promise.resolve(MRIType);
	})
	.then(function(MRIType){
		//console.log(MRIType);
		var changeinfo = {DocType: 'MRIType', ChangeType: 'add', DocID: newMRIType.TypeID};
		var newDoc = MRIType;
		var oldDoc = 'addnew';
		var uid = req.user.uid;
		return changelog.addChange(uid, oldDoc, newDoc, changeinfo);
	})
	.catch(function(err){
		console.log(err);
	});
});

//remove a mri type
router.delete('/raw/MRITypes/:Type', ensureAuthenticated, function(req, res) {
	var type = req.params.Type;

	MRITypes.getMRIByType(type)
	.then(function(oldMRIType){
		var oldDoc = oldMRIType;
		return Promise.resolve(oldDoc);
	})
	.then(function(oldDoc){
		MRITypes.deleteMRIType(type)
		return Promise.resolve(oldDoc);
	})
	.then(function(oldDoc){
		//console.log(oldDoc);
		var changeinfo = {DocType: 'MRIType', ChangeType: 'delete', DocID: type};
		var uid = req.user.uid;
		var newDoc = "deleteDoc";
		return changelog.addChange(uid, oldDoc, newDoc, changeinfo);
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
	})
	.catch(function(err){
		console.log(err);
	});
});


//edit a meg type
router.put('/raw/MEGType/:Type', ensureAuthenticated, function(req, res) {
	var newMEGType = req.body;
	var uid = req.user.uid;
	var type = req.params.Type;
	//console.log("hi"+newMEGType, type);

	MEGTypes.getMEGByType(type)
	.then(function(oldMEGType){
		var oldDoc = oldMEGType;
		return Promise.resolve(oldDoc);
	})
	.then(function(oldDoc){
		MEGTypes.editMEGType(type, newMEGType);
		return Promise.resolve(oldDoc);
	})
	.then(function(oldDoc){
		var newDoc = newMEGType;
		var changeinfo = {DocType: 'MEGType', ChangeType: 'update', DocID: newMEGType.TypeID};
		return changelog.addChange(uid, oldDoc, newDoc, changeinfo);
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
		//res.json(MEGType);
		return Promise.resolve(MEGType);
	})
	.then(function(MEGType){
		console.log(MEGType);
		var changeinfo = {DocType: 'MEGType', ChangeType: 'add', DocID: newMEGType.TypeID};
		var newDoc = MEGType;
		var oldDoc = 'addnew';
		var uid = req.user.uid;
		return changelog.addChange(uid, oldDoc, newDoc, changeinfo);
	})
	.catch(function(err){
		console.log(err);
	});
});

//remove a meg type
router.delete('/raw/MEGTypes/:Type', ensureAuthenticated, function(req, res) {
	var type = req.params.Type;

	MEGTypes.getMEGByType(type)
	.then(function(oldMEGType){
		var oldDoc = oldMEGType;
		return Promise.resolve(oldDoc);
	})
	.then(function(oldDoc){
		MEGTypes.deleteMEGType(type);
		return Promise.resolve(oldDoc);
	})
	.then(function(oldDoc){
		//console.log(oldDoc);
		var changeinfo = {DocType: 'MEGType', ChangeType: 'delete', DocID: type};
		var uid = req.user.uid;
		var newDoc = "deleteDoc";
		return changelog.addChange(uid, oldDoc, newDoc, changeinfo);
	})
	.catch(function(err){
		console.log(err);
	})
});


//=============================== USER CONTROL ===============================


//get all recorded users
router.get('/raw/Users', ensureAuthenticated, function(req, res) {

	AuthenList.getAllUsers()
	.then(function(Users) {
		res.json(Users);
	});
});


//get single user 
router.get('/raw/Users/:uid', ensureAuthenticated, function(req, res) {
	var uid = req.params.uid;
	AuthenList.getUser(uid)
	.then(function(User) {
		res.json(User);
	});
});


//edit a user's accessibility
router.put('/raw/Users/:uid', ensureAuthenticated, function(req, res) {
	var newUser = req.body;
	var uid = req.params.uid;
	var edituid = req.user.uid;

	AuthenList.getUser(uid)
	.then(function(oldUser){
		var oldDoc = oldUser;
		return Promise.resolve(oldDoc);
	})
	.then(function(oldDoc){
		AuthenList.editUser(uid, newUser);
		return Promise.resolve(oldDoc);
	})
	.then(function(oldDoc){
		var newDoc = newUser;
		var changeinfo = {DocType: 'User', ChangeType: 'update', DocID: newUser.uid};
		return changelog.addChange(edituid, oldDoc, newDoc, changeinfo);
	})
	.catch(function(err){
		console.log(err);
	});
});


//add a new user
router.post('/raw/Users', ensureAuthenticated, function(req, res) {
	var newUser = req.body;
	AuthenList.addUser(newUser)
	.then(function(user) {
		//res.json(user);
		return Promise.resolve(user);
	})
	.then(function(user){
		console.log(user);
		var changeinfo = {DocType: 'User', ChangeType: 'add', DocID: newUser.uid};
		var newDoc = user;
		var oldDoc = 'addnew';
		var uid = req.user.uid;
		return changelog.addChange(uid, oldDoc, newDoc, changeinfo);
	})
	.catch(function(err){
		console.log(err);
	});
});

//remove a recorded user
router.delete('/raw/Users/:uid', ensureAuthenticated, function(req, res) {
	var uid = req.params.uid;
	var edituid = req.user.uid;

	AuthenList.getUser(uid)
	.then(function(oldUser){
		var oldDoc = oldUser;
		return Promise.resolve(oldDoc);
	})
	.then(function(oldDoc){
		AuthenList.deleteUser(uid);
		return Promise.resolve(oldDoc);
	})
	.then(function(oldDoc){
		//console.log(oldDoc);
		var changeinfo = {DocType: 'User', ChangeType: 'delete', DocID: uid};
		var newDoc = "deleteDoc";
		return changelog.addChange(edituid, oldDoc, newDoc, changeinfo);
	})
	.catch(function(err){
		console.log(err);
	});
});






// ==================== EVERYTHING RELATED TO CHANGELOG =================

router.get('/raw/changelog', ensureAuthenticated, function(req, res){
	var uid = req.user.uid;

	changelog.getAllChanges(uid)
	.then(function(changes){
		res.json(changes);
	});

});


router.get('/raw/changelog/:DocumentID', ensureAuthenticated, function(req, res){
	var uid = req.user.uid;
	var docID = req.params.DocumentID;

	changelog.getChangeOfOne(docID)
	.then(function(change){
		res.json(change);
	});

});

router.get('/raw/changelogs/:docType/:DocumentID', ensureAuthenticated, function(req, res){
	var uid = req.user.uid;
	var docID = req.params.DocumentID;
	var docType = req.params.docType;

	changelog.getChangeOfOne_scans(docType, docID)
	.then(function(change){
		res.json(change);
	});

});

router.get('/raw/changelogdoctype/:DocumentType', ensureAuthenticated, function(req, res){
	var uid = req.user.uid;
	var docType = req.params.DocumentType;

	changelog.getChangeOfDocType(docType)
	.then(function(change){
		res.json(change);
	});

});

//remove a recorded user
router.delete('/raw/changelog/:change_id', ensureAuthenticated, function(req, res) {

	var uid = req.user.uid;
	var change_id = req.params.change_id;

	changelog.deleteaChange(change_id)
	.then(function(){
		res.json("Deleted!");
	})
	.catch(function(err){
		console.log(err);
	});

});













//======================== OTHER FEATURES ===========================

//table of information for projects page
router.get('/raw/getprojectinfo/:ProjectID', ensureAuthenticated, function(req, res){
	var uid = req.user.uid;
	var projectID = req.params.ProjectID;

	scanSession.getScanSessionByProjectID(projectID, uid)
	.then(function(scans){
		var Ages = [];
		var MEGScanTypes = [];
		var MRIScanTypes = [];
		var TestTypes = [];
		var scansessions = [];

		//gather all scan sessions
		for (var temp in scans)
		{
			var SubjectScanSessions = scans[temp].ScanSessions;
			var scansessions = scansessions.concat(SubjectScanSessions);
		}

		//go through all scan sessions
		//console.log(scansessions);
		for (var num in scansessions)
		{
			//console.log(scansessions[num]);
			var MEGforThisSubject = scansessions[num].MEGScans;
			var MRIforThisSubject = scansessions[num].MRIScans;
			var TestsforThisSubject = scansessions[num].TestResults;

			//add all meg scan types into one array and age to age array
			for (var i in MEGforThisSubject)
			{
				MEGScanTypes.push(MEGforThisSubject[i].ScanType);
				if (MEGforThisSubject[i].AgeAtScan != '' && MEGforThisSubject[i].AgeAtScan != undefined
					&& MEGforThisSubject[i].AgeAtScan != null)
				{
					Ages.push(MEGforThisSubject[i].AgeAtScan);
				}
				
			}

			//add all mri scan types into one array and age to age array
			for (var j in MRIforThisSubject)
			{
				MRIScanTypes.push(MRIforThisSubject[j].ScanType);
				if (MRIforThisSubject[j].AgeAtScan != '' && MRIforThisSubject[j].AgeAtScan != undefined
					&& MRIforThisSubject[j].AgeAtScan != null)
				{
					Ages.push(MRIforThisSubject[j].AgeAtScan);
				}
				
			}

			//add all test types into one array and age to age array
			for (var k in TestsforThisSubject)
			{
				TestTypes.push(TestsforThisSubject[k].Type);
				if (TestsforThisSubject[k].Age != '' && TestsforThisSubject[k].Age != undefined
					&& TestsforThisSubject[k].Age != null)
				{
					Ages.push(TestsforThisSubject[k].Age);
				}
				
			}

		}

		//find max and min ages
		var maxAge = getMaxOfArray(Ages);
		var minAge = getMinOfArray(Ages);
		//console.log(maxAge, minAge);

		
		//sort the meg and mri scan types and test types
		var MEGTypes = {};
		MEGScanTypes.forEach(function(x) { MEGTypes[x] = (MEGTypes[x] || 0)+1; });
		//console.log(MEGTypes);
		var MRITypes = {};
		MRIScanTypes.forEach(function(x) { MRITypes[x] = (MRITypes[x] || 0)+1; });
		//console.log(MRITypes);
		var Testtypes = {};
		TestTypes.forEach(function(x) { Testtypes[x] = (Testtypes[x] || 0)+1; });
		//console.log(Testtypes);

		var projectInfo = {
			subjectNumber: scans.length,
			subjectMaxAge: maxAge,
			subjectMinAge: minAge,
			MEGTypes: MEGTypes,
			MRITypes: MRITypes,
			TestTypes: Testtypes
		};
		res.json(projectInfo);
	})

});

//convert to json
router.get('/raw/convertthistojson',  ensureAuthenticated, function(req, res){

	["./Data/MJTdata_subjectlist1.xlsx"].forEach(function (element) {	
	  	convert.toJson(
		    path.join(__dirname, element),  //excell file 
		    path.join(__dirname, "./json/subjects"), //json dir 
		    1,  //excell head line number 
		    "," //array separator 
  		)
	 });
	["./Data/MJTdata_projectlist1.xlsx"].forEach(function (element) {	
	  	convert.toJson(
		    path.join(__dirname, element),  //excell file 
		    path.join(__dirname, "./json/projects"), //json dir 
		    1,  //excell head line number 
		    "," //array separator 
  		)
	 });
	["./Data/MJTdata_scansessionlist1.xlsx"].forEach(function (element) {	
	  	convert.toJson(
		    path.join(__dirname, element),  //excell file 
		    path.join(__dirname, "./json/scansessions"), //json dir 
		    1,  //excell head line number 
		    "," //array separator 
  		)
	 });

});


router.get('/raw/testtojson',  ensureAuthenticated, function(req, res){

	["./Data/MJTdata_subjectlist1.xlsx"].forEach(function (element) {	
	  	convert.toJson(
		    path.join(__dirname, element),  //excell file 
		    path.join(__dirname, "./json/subjects"), //json dir 
		    1,  //excell head line number 
		    "," //array separator 
  		)
	 });
	["./Data/MJTdata_projectlist1.xlsx"].forEach(function (element) {	
	  	convert.toJson(
		    path.join(__dirname, element),  //excell file 
		    path.join(__dirname, "./json/projects"), //json dir 
		    1,  //excell head line number 
		    "," //array separator 
  		)
	 });
	["./Data/MJTdata_scansessionlist1.xlsx"].forEach(function (element) {	
	  	convert.toJson(
		    path.join(__dirname, element),  //excell file 
		    path.join(__dirname, "./json/scansessions"), //json dir 
		    1,  //excell head line number 
		    "," //array separator 
  		)
	 });

});



module.exports = router;

function checkIfUniqueArray (array){
	return array.length === new Set(array).size;
}

function getMaxOfArray(numArray) {
  return Math.max.apply(null, numArray);
}

function getMinOfArray(numArray) {
  return Math.min.apply(null, numArray);
}