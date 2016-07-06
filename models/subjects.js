//var assert = require("assert");
var Promise = require("bluebird");
var mongoose = require('mongoose');
var moment = require('moment');
Promise.promisifyAll(mongoose);
var Schema = mongoose.Schema;
var enumSex = ['Female','Male', 'Unknown', 'Other'];
var enumHandedness = ['Left', 'Right','Other','Unknown'];
var enumDiagnosis = ['Control','Pre-term','Autism','ASD', 'BPD', 'Other', 'Unknown'];
var uniqueValidator = require('mongoose-unique-validator');

var scanSessions = require('./scanSessions');
//var beautifyUnique = require('mongoose-beautiful-unique-validation');

/*scan session schema
var scanSessionSchema = new Schema({
	"SessionID": String,
	"ParticipantAge": {
		type: Number, 
		min: 0,
		max: 100
	},

	"MEGScans": {
		"ScanName": String,
		"ScanDate": Date
	},

	"MRIScans": {
		"ScanName": String,
		"ScanDate": Date
	},

	"TestResults":{
		"IQScore": Number,
		"ADHDScale": Number
	}
});*/

//list of projects that a subject is involved in Schema
var projectPerSubjectSchema = new Schema({
	"ProjectID": {type: String, ref: 'Project'},
	"SubjectIDinProject": {type: String, ref: 'scanSessions'},
	"ScanSessions": [{type: String, ref: 'scanSessions'}]
});

//subject schema
var subjectSchema = new Schema({

	ID: {type: String, required: true, unique: true},
	Sex: {type: String, enum: enumSex},
	Handedness: {type: String, enum: enumHandedness},
	Diagnosis: {type:String, enum:enumDiagnosis},
	DateOfBirth: {type:Date},
	Other: String,
	ContactPermit: String,
	MRN: Number,
	Projects:[projectPerSubjectSchema]
});

//subjectSchema.plugin(beautifyUnique);
//projectPerSubjectSchema.plugin(beautifyUnique);
subjectSchema.plugin(uniqueValidator);
projectPerSubjectSchema.plugin(uniqueValidator)

var Subject = module.exports = mongoose.model('Subject', subjectSchema, 'subjectsList');

//get all subjects
module.exports.getSubjects = function(){
	return Promise.resolve().then (function(){
		return Subject.findAsync();
	});
}

//get a subject
module.exports.getSubjectById = function(id){
	return Promise.resolve().then(function(){
		return Subject.findOneAsync({ID:id});
	});
}

//add a subject
module.exports.addSubject = function(subject){
	return Promise.resolve().then(function(){
		//check data
		
		var testSubject = new Subject(subject);
		var error = testSubject.validateSync();
		var testSubjectProject = testSubject.Projects;
		console.log("hi" + error);

		//check the error in mongoose subject schema
		if (error != undefined){

			//error with ID
			if ((error.errors['ID']!= undefined) && 
				((error.errors['ID'].message) == "Path `ID` is required."))
			{
				console.log('Subject ID is required!');
			}
			
			if ((error.errors['Sex'] != undefined )&&
				((error.errors['Sex'].kind) == "enum"))
			{
				console.log("Invalid 'Sex' type, please choose subject's sex from the drop-down list.");
			}


			if ((error.errors['Handedness'] != undefined) && 
				((error.errors['Handedness'].kind) =="enum"))
			{
				console.log("Invalid 'Handedness' type, please choose subject's handedness from the drop-down list.");
			}

			if ((error.errors['Diagnosis'] != undefined) && 
				((error.errors['Diagnosis'].kind) =="enum"))
			{
				console.log("Invalid 'Diagnosis' type, please choose subject's diagnosis from the drop-down list.");
			}

			if ((error.errors['DateOfBirth'] != undefined) && 
				((error.errors['Diagnosis'].kind) =="Date"))
			{
				console.log("Invalid 'DateOfBirth' type, it must be a date!");
			}
			return Promise.reject();
		}

		else {

			console.log("HI" + subject + testSubjectProject);
			for (var num in testSubjectProject)
			{
				console.log(testSubjectProject);
				if(testSubjectProject[num].ProjectID == '')
				{
					console.log("Project ID cannot be empty");
					return Promise.reject();
				}
				if(testSubjectProject[num].SubjectIDinProject == '')
				{
					console.log("Subject ID in Project cannot be empty");
					return Promise.reject();
				}
			}
			console.log("what");

			//check project duplicate
			var projectEntered = [];
			var SubjectIDEntered = [];
			for (var num in testSubjectProject)
			{
				projectEntered.push(testSubjectProject[num].ProjectID);
				SubjectIDEntered.push(testSubjectProject[num].SubjectIDinProject);
			}
			if(checkIfUniqueArray(projectEntered) == false){
				console.log ("Duplicate 'Project(s) Enrolled' fields!")
				return Promise.reject();
			}
			//if (checkIfUniqueArray(SubjectIDEntered) == false){
			//	console.log ("Subject ID in each project must be unique!");
			//	return Promise.reject();
			//}
		}
		return Promise.resolve();
	})
	
	.then(function (){
		console.log("add subject");
		console.log(subject);
		return Subject.createAsync(subject);
	})
	.catch(function(err){
		console.log("subject cannot be added+ "+err);
		return Promise.reject();
	});
}

//update a subject
module.exports.updateSubject = function(id, subject, value){
	return Promise.resolve()
	.then(function(){
		//check data

		var testSubject = new Subject(subject);
		var error = testSubject.validateSync();
		var testSubjectProject = testSubject.Projects;
		console.log("hi" + subject);
		//console.log(error);

		if (error != undefined){

			//error with ID
			console.log(error.errors['ID']);
			if ((error.errors['ID']!= undefined) && 
				((error.errors['ID'].message) == "Path `ID` is required."))
			{
				console.log('Subject ID is required!');
			}
			
			if ((error.errors['Sex'] != undefined )&&
				((error.errors['Sex'].kind) == "enum"))
			{
				console.log("Invalid 'Sex' type, please choose subject's sex from the drop-down list.");
			}


			if ((error.errors['Handedness'] != undefined) && 
				((error.errors['Handedness'].kind) =="enum"))
			{
				console.log("Invalid 'Handedness' type, please choose subject's handedness from the drop-down list.");
			}

			if ((error.errors['Diagnosis'] != undefined) && 
				((error.errors['Diagnosis'].kind) =="enum"))
			{
				console.log("Invalid 'Diagnosis' type, please choose subject's diagnosis from the drop-down list.");
			}

			if ((error.errors['DateOfBirth'] != undefined) && 
				((error.errors['Diagnosis'].kind) =="Date"))
			{
				console.log("Invalid 'DateOfBirth' type, it must be a date!");
			}

			return Promise.reject();
		}

		else {
			//check project duplicate
			var projectEntered = [];
			var SubjectIDEntered = [];
			for (var num in testSubjectProject)
			{
				projectEntered.push(testSubjectProject[num].ProjectID);
				SubjectIDEntered.push(testSubjectProject[num].SubjectIDinProject);
			}
			//console.log(projectEntered);
			//console.log(SubjectIDEntered);
			if(checkIfUniqueArray(projectEntered) == false){
				console.log ("Duplicate 'Project(s) Enrolled' fields!")
				return Promise.reject();
			}
		}

		return Promise.resolve();
	})
	.catch(function(err){
		console.log("error with validation " + err);
		return Promise.reject();
	})
	.then(function(){
		var project = require('./projects');
		console.log(value);
		return project.updateSubject(id, value.old, value.new);
	})
	.catch(function(err){
		console.log("error with update subject + " + err);
		return Promise.reject(err);
	})

	.then(function(){
		console.log(subject.DateOfBirth);
		var query = {ID:id};
		var update = {
			ID: subject.ID,
			Sex: subject.Sex,
			Handedness: subject.Handedness,
			Diagnosis: subject.Diagnosis,
			DateOfBirth: subject.DateOfBirth,
			ContactPermit: subject.ContactPermit,
			MRN: subject.MRN,
			Other: subject.Other,
			Projects: subject.Projects
			//$set: {Projects: subject.Projects}
		};
		var option = {runValidators: true, context: 'query'};
		return Subject.findOneAndUpdateAsync(query, update, option);
	});	
}

//delete a subject
module.exports.deleteSubject = function(id){
	return Promise.resolve().then(function(){
		//check

		return Promise.resolve();
	}).then (function (){
		var query = {ID:id};
		return Subject.findOneAsync(query);
	}).then(function (subject){
		var projects = subject.Projects;
		var ProjectIDs = projects.map(function (a) {return a.ProjectID;});
		var SubjectIDs = projects.map(function (a) {return a.SubjectIDinProject;});
		var Project = require('./projects');
		//console.log(Project);
		return Project.deleteSubject(id, ProjectIDs, SubjectIDs, {});
	})
	.then(function(){
		return scanSessions.deleteEntireScanSession(id);
	})
	.then(function (){
		var query = {ID:id};
		return Subject.removeAsync(query);
	});
	
}

//use for posting subject but when error occur with adding subject into the project list
module.exports.deleteSubjectOnly = function(id){
	return Promise.resolve().then (function (){
		//check data
		return Promise.resolve();
	}).then(function (){
		var query = {ID:id};
		return Subject.removeAsync(query);
	});	
}

//use when one project is deleted, go through all subjects to find that project and delete it
module.exports.deleteProject = function (projectID, subjectsID){
	return Promise.resolve()
	.then (function (){
		//check data
		console.log("in here");
		return Promise.resolve();
	}).then(function (){

		if (subjectsID != null)
		{
			for (var num in subjectsID)
			{
				var s_ID = subjectsID[num].GlobalID;
				var query = {ID:s_ID};
				var update = {$pull: {'Projects': {ProjectID: projectID}}};
				Subject.updateAsync(query, update);
			}
		}
		
		return Promise.resolve();
	});	
}

//use when a project is created, check if any of the added subjects exists
//if subject exist, add the project to the projectes enrolled list under that subject
//if subject does not exist, create a new subject and include the project in that subject
module.exports.updateOrAddSubject = function(projectID, subjectsID){
	
	return Promise.resolve()
	.then(function(){
		//check if subject does not exist
		//console.log(subjectsID);
		var globalIDs = subjectsID.GlobalID;
		var inProjectIDs = subjectsID.inProjectIDs;
		console.log("i came here");

		return Promise.all(
			subjectsID.map(function(curSub, ind){
				var curGID = curSub.GlobalID;
				var curPID = curSub.inProjectID;
				//check if this global ID already exists
				return Subject.findOneAsync({ID:curGID})
				//found the subject, add project to it's enrolled list
				.then(function(subject){
					//console.log(subject);
					if (subject != null)
					{
						var newProject = {ProjectID: projectID, SubjectIDinProject:curPID};
						var query, update;
						
						//check if the project already exists
						var projectList = (subject.Projects).map(function(a){return a.ProjectID});
						projectList.push(curPID);

						if(checkIfUniqueArray(projectList) == false){
							query = {ID:curGID, "Projects.ProjectID": projectID};
							update = {$set: {'Projects.$.SubjectIDinProject': curPID}};
						}

						else {
							query = {ID:curGID};
							update = {$addToSet:{'Projects':newProject}};
						}
						
						Subject.updateAsync(query, update)
						.then(function(){
							var newsession = {
								"SubjectID": curGID,
								"SubjectIDinProject": curPID,
								"relatedProject": projectID,
								"ScanSessions":[{SessionID:curPID + '_A', MEGScans: [], MRIScans: [], TestResults: []}] 
							};
							return scanSessions.addScanSession(newsession);
						})
						.catch(function(err){
							return Promise.reject(err);
						})
					}

					else {
						var newProject = {ProjectID: projectID, SubjectIDinProject:curPID};
						var newSubject = {ID: curGID, 
										  Projects:[newProject]};
						Subject.addSubject(newSubject)
						.then(function(){
							var newsession = {
								"SubjectID": curGID,
								"SubjectIDinProject": curPID,
								"relatedProject": projectID,
								"ScanSessions":[{SessionID:curPID+'_A', MEGScans: [], MRIScans: [], TestResults: []}] 
							};
							return scanSessions.addScanSession(newsession);
						})
						.catch(function(err){
							return Promise.reject(err);
						})
					}


					return Promise.resolve();
				})

				//cannot find the subject, thus add a new subject
				.catch(function(err){
					console.log(err);
					console.log("err with adding subject");
					return Promise.reject();
				});
			})
		);
	})

	.then(function(){
		return Promise.resolve();
	})

	.catch(function(err){
		console.log(err);
		console.log("can't add subject");
		return Promise.reject(err);
	})	
}

//use when updating a project, check the subjects list and update accordingly
module.exports.updateSubjectFromProject = function(projectID, oldSubjects, newSubjects){
	return Promise.resolve().then(function(){
		var subjectIDs = formUpdatedSubjectArray(oldSubjects, newSubjects);
		console.log(subjectIDs);
		return Promise.all(
			subjectIDs.map(function(cur_subject, ind){
				Subject.findOneAsync({ID:cur_subject.globalID})
				.then(function(subject){

					//if the subject exists
					if (subject != null)
					{
						var subjectGID = subject.ID;
						console.log(subject.ID, cur_subject)

						//if making a change to the existing subject in the project.
						if((cur_subject.oldsubjectID!=null) && (cur_subject.newsubjectID!=null))
						{
							var query = {ID: subjectGID, "Projects.ProjectID": projectID};
							var update = {$set:{'Projects.$.SubjectIDinProject':cur_subject.newsubjectID}};
							console.log("update");
							
							Subject.updateAsync(query, update)
							.then(function(){
								var theScanSession = require('./scanSessions');

								var newSessionInfo = {
									SubjectID:subjectGID,
									relatedProject: projectID,
									SubjectIDinProject: cur_subject.newsubjectID
								};

								theScanSession.updateScanSessionBasicInfo(projectID, cur_subject.oldsubjectID, newSessionInfo)
								.then(function(){
									return Promise.resolve();
								})
								.catch(function(err){
									return Promise.reject(err);
								})
							})
						}

						//if an existing subject is being enrolled in the project, update the subject's project list
						//and add a new scan document for the subject in this project
						else if (cur_subject.oldsubjectID==null)
						{
							var newProject = {ProjectID:projectID, SubjectIDinProject:cur_subject.newsubjectID};
							var query = {ID: subject.ID};
							var update = {$addToSet:{'Projects':newProject}};
							console.log("add");

							Subject.updateAsync(query, update)
							.then(function(){
								var theScanSession = require('./scanSessions');
								var newscansession = {
									"SubjectID": subjectGID,
									"relatedProject":projectID,
									"SubjectIDinProject": cur_subject.newsubjectID,
									"ScanSessions": [{
										'SessionID':cur_subject.newsubjectID + "_A", 
										'MEGScans':[],
										'MRIScans':[],
										'TestResults':[]
									}]
								};
								theScanSession.addScanSession(newscansession)
								.then(function(){
									return Promise.resolve();
								})
								.catch(function(err){
									return Promise.reject(err);
								})
							})							
						}

						//if theres is no new subject ID which mean that an exisitng subjec in this project has been deleted
						//then delete the project from the subject's list of project
						//and remove the subject's document from the scan session collecion
						else if (cur_subject.newsubjectID==null)
						{
							var query = {ID: subjectGID};
							var update = {$pull:{Projects: {ProjectID:projectID}}};
							console.log("delete");
							
							Subject.updateAsync(query, update)
							.then(function(){
								var theScanSession = require('./scanSessions');
								
								theScanSession.deleteEntireScanSessionByinProjectID(cur_subject.oldsubjectID)
								.then(function(){
									return Promise.resolve();
								})
								.catch(function(err){
									return Promise.reject(err);
								})
							})
						}
						
					}

					else 
					{
						var newProject = {ProjectID: projectID, SubjectIDinProject:cur_subject.newsubjectID};
						var newSubject = {ID: cur_subject.globalID, 
										  Projects:[newProject]};
						Subject.addSubject(newSubject)
						.then(function(){
							var theScanSession = require('./scanSessions');
							var newscansession = {
								"SubjectID": cur_subject.globalID,
								"relatedProject":projectID,
								"SubjectIDinProject": cur_subject.newsubjectID,
								"ScanSessions": [{
									'SessionID':cur_subject.newsubjectID + "_A", 
									'MEGScans':[],
									'MRIScans':[],
									'TestResults':[]
								}]
							};
							theScanSession.addScanSession(newscansession)
							.then(function(){
								return Promise.resolve();
							})
							.catch(function(err){
								return Promise.reject();
							})
						})
						.then(function(){
							return Promise.resolve();
						})
						.catch(function(err){
							return Promise.reject(err);
						})
					}
				
				})
				.catch(function(err){
					console.log(err + "nonono");
					return Promise.reject();
				})
			})

		);
	})
	.then(function(){
		return Promise.resolve();
	})
	.catch(function(){
		return Promise.reject();
	})
}

/*module.exports.addSubjectScanSession = function(subjectID, projectID, scanSession){
	return Promise.resolve()
	.then(function(){
		var newScanSession = scanSession.SessionID;
		console.log(newScanSession);
		var query = {ID: subjectID, 'Projects.ProjectID': projectID};
		var update = {$addToSet: {'Projects.$.ScanSessions': newScanSession}};
		var option = {runValidators: true, context: 'query'};
		return Subject.updateAsync(query, update, option);
	})
	.catch(function(err){
		console.log(err);
		return Promise.reject(err);
	});
}*/

module.exports.updateSingleScanInSubject = function(subjectID, inProjectID, projectID, sessionID, scanSession){
	return Promise.resolve()
	
	// .then(function(){
	// 	var theScanSession = require('./scanSessions');
	// 	var query = {SubjectIDinProject:inProjectID, 'ScanSessions.SessionID':sessionID};
	// 	var update = {$set: {'ScanSessions.$': scanSession}};
	// 	var option = {runValidators: true, context: 'query'};
	// 	return theScanSession.findOneAndUpdateAsync(query, update, option);
	// })
	.then(function(){
		return Subject.findOneAsync({ID:subjectID, 'Projects.ProjectID': projectID}, 
			{'DateOfBirth':1});
	})
	.catch(function(err){
		console.log("can't find subject " + err );
		return Promise.reject(err);
	})
	.then(function(oldProjectInfo){
		console.log(oldProjectInfo);
		var newScanSession = scanSession.SessionID;

			var bday = moment(oldProjectInfo.DateOfBirth);
			var birthday = bday.format();
			var neededInfo = {bday: birthday};
			return Promise.resolve(neededInfo);
		

	})	
	.then (function(neededInfo){
		console.log(neededInfo.bday);

		
		//assign age at each scan and test
		calculate_age_at_scan_and_test(scanSession, neededInfo.bday);
		return Promise.resolve();

		// //update the subject : only the scanIDs
		// var query = {ID: subjectID, 'Projects.ProjectID': projectID};
		// var update = {$set: {'Projects.$.ScanSessions': newScanIDs}};
		// var option = {runValidators: true, context: 'query'};
		// return Subject.updateAsync(query, update, option);
	})
	.then(function(){
		var theScanSession = require('./scanSessions');
		var query = {SubjectIDinProject:inProjectID, 'ScanSessions.SessionID':sessionID};
		var update = {$set: {'ScanSessions.$': scanSession}};
		var option = {runValidators: true, context: 'query'};
		return theScanSession.findOneAndUpdateAsync(query, update, option);
	})
	.catch(function(err){
		console.log(err);
		return Promise.reject(err);
	});
}

// module.exports.deleteSingleScanInSubject = function(subjectID, projectID, scanSessionID){
// 	return Promise.resolve()
// 	.then (function(){
// 		var query = {ID:subjectID, 'Projects.ProjectID': projectID};
// 		var update = {$pull: {'Projects.$.ScanSessions': scanSessionID}};
// 		var option = {};
// 		return Subject.updateAsync(query, update, option);
// 	})
// 	.catch(function(err){
// 		return Promise.reject(err);
// 	});
// }




//==================== search features ==========================

module.exports.searchSubjectsByID = function(IDs){
	return Promise.resolve()
	.then(function(){
		return Subject.findAsync({ID:{$in:IDs}});
	});
}

module.exports.getSubjectsByInfo = function(sex, handedness, diagnosis, projects){
	return Promise.resolve()
	.then(function(){
		console.log(sex, handedness, diagnosis, projects);

		var query = querySubjectInfo(sex, handedness, diagnosis, projects);
		return Subject.findAsync(query);
	});
}

module.exports.getSubjectsOfMatchingID = function(userInput){
	return Promise.resolve()
	.then (function (){
		//check data
		if (userInput == "")
		{
			console.log("no input");
			return Promise.reject("no input");
		}
		else
		{
			return Promise.resolve();
		}
		
	})
	.then(function (){
		return Subject.findAsync({ID:{$regex:".*" + userInput + ".*", $options:'i'}});
	});	
}



//==================== other functions ==========================

function checkIfUniqueArray (array){
	return array.length === new Set(array).size;
}

function formUpdatedSubjectArray (oldsubject, newsubject){

	for (var num in oldsubject)
	{
		oldsubject[num].used = false;
	}

	for (var num in newsubject)
	{
		newsubject[num].used = false;
	}

	var updatedArray = [];
	var olen = oldsubject.length;
	var nlen = newsubject.length;

	//run the old subjects object array
	for (var i = 0; i < olen; i++){
		var oldID = oldsubject[i].GlobalID;
		//check all documents in the new subject list
		for (var j = 0; j<nlen; j++){
			//console.log(newsubject[j]);
			var newID = (newsubject[j]).GlobalID;
			//if there is a match, add to the updated list
			if(newID == oldID)
			{
				updatedArray.push({
					globalID: oldsubject[i].GlobalID,
					oldsubjectID: oldsubject[i].inProjectID,
					newsubjectID: newsubject[j].inProjectID
				});
				//newsubject.splice(j,1);
				oldsubject[i].used = true;
				newsubject[j].used = true;
				//nlen--;
			}
		}
		//updated subject document has deleted one of its projects in the old doc
		//add this old doc to the updated array with newsubjectID == null
		//console.log("done updated array");
		if (oldsubject[i].used == false)
		{
			updatedArray.push({
				globalID: oldsubject[i].GlobalID,
				oldsubjectID: oldsubject[i].inProjectID,
				newsubjectID: null
			});
		}
	}

	//console.log("done old array");
	//run the new subjects version2 object array, this for loop accounts for the newly added projects
	var nlen2 = newsubject.length;
	for (var i=0; i<nlen2; i++){
		var newID = newsubject[i].GlobalID;
		if(newsubject[i].used == false)
		{
			updatedArray.push({
			globalID: newsubject[i].GlobalID,
			oldsubjectID: null,
			newsubjectID: newsubject[i].inProjectID
			});
		}
		
	}

	return updatedArray;
}

function querySubjectInfo (sex, handedness, diagnosis, projects) {
	var query = {Sex:sex, Handedness:handedness, Diagnosis:diagnosis, 'Projects.ProjectID':{$in:projects}};
	
	if (sex == 'All')
	{
		delete query.Sex;
	}

	if (handedness == 'All')
	{
		delete query.Handedness;
	}

	if (diagnosis == 'All')
	{
		delete query.Diagnosis;
	}

	if (projects[0] == 'All')
	{
		delete query['Projects.ProjectID'];
	}

	return query;
}

function calculate_age_at_scan_and_test(scanSession, subjectBirthday){
	console.log("birthday" + subjectBirthday);
	var test = scanSession.TestResults;
	var megScans = scanSession.MEGScans;
	var mriScans = scanSession.MRIScans;

	if (subjectBirthday != undefined)
	{

		//==== for test result ages =====
		if (test.length != 0)
		{
			for (var num in test)
			{
				//if test date is not provided, age set to -
				if (test[num].TestDate == '' || test[num].TestDate == undefined)
				{
					var testage = '-';
				}
				else
				{
					var testDate = moment(test[num].TestDate);
					var testage = testDate.diff(subjectBirthday, 'years', true).toFixed(2);
				}

				test[num].Age = testage;
			}
		}


		//==== for meg scan ages =====
		if (megScans.length != 0)
		{
			for (var num in megScans)
			{
				if (megScans[num].ScanDate != null)
				{
					
					if (megScans[num].ScanDate == '' || megScans[num].ScanDate == undefined)
					{
						var megage = '-';
					}
					else
					{
						var testDate = moment(megScans[num].ScanDate);
						var megage = testDate.diff(subjectBirthday, 'years', true).toFixed(2);
					}
					
					megScans[num].AgeAtScan = megage;
				}	
			}
		}

		//==== for mri scan ages =====
		if (mriScans.length != 0)
		{
			for (var num in mriScans)
			{
				if (mriScans[num].ScanDate == '' || mriScans[num].ScanDate == undefined)
				{
					var mriage = '-';
				}
				else
				{
					var testDate = moment(mriScans[num].ScanDate);
					var mriage = testDate.diff(subjectBirthday, 'years', true).toFixed(2);
				}
				
				mriScans[num].AgeAtScan = mriage;
			}
		}
	}
}