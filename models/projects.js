var Promise = require('bluebird');
var mongoose = require('mongoose');
Promise.promisifyAll(mongoose);
var Schema = mongoose.Schema;
var uniqueValidator = require('mongoose-unique-validator');
//var theSubject = require ('./subjects');
var scanSessions = require('./scanSessions');

//subjects list in each project
var SubjectsIDSchema = new Schema({
	"GlobalID": {type:String, required: true, ref:'Subject'},
	"inProjectID": {type:String, required: true} 
});


//project schema
var projectSchema = new Schema({

	"ProjectID": {type: String, required:true, unique: true},
	"ProjectName": {type: String, required:true, unique: true},
	//"SubjectsID":String
	"SubjectsID":[SubjectsIDSchema]
});

SubjectsIDSchema.plugin(uniqueValidator);
projectSchema.plugin(uniqueValidator);
var Project = module.exports = mongoose.model('Project', projectSchema, 'projectsList');

//get all projects
module.exports.getProjects = function(){
	return Promise.resolve().then (function() {
		return Project.findAsync();
	});
	//Project.find(callback).limit(limit);
}

//get one project
module.exports.getProjectById = function(id){
	return Promise.resolve().then (function() {
		return Project.findOneAsync({ProjectID:id});
	});
	//Project.find(callback).select({"Project Name": name});
}

//add a project
module.exports.addProject = function(project){
	return Promise.resolve().then(function (){
		//check data 

		var testProject = new Project(project);
		var error = testProject.validateSync();
		//console.log(error);
		var testSubjects = testProject.SubjectsID;
		var projectID = testProject.ProjectID;
		console.log(testSubjects);

		//check schema error
		if (error != undefined)
		{
			if ((error.errors['ProjectID'] != undefined) &&
				(error.errors['ProjectID'].message) == "Path `ProjectID` is required.")
			{
				console.log('Project ID must not be empty!');
			}

			if ((error.errors['ProjectName'] != undefined) &&
				(error.errors['ProjectName'].message) == "Path `ProjectName` is required.")
			{
				console.log('Please enter the project name!');
			}

			return Promise.reject(err);
		}

		//check other errors mongoose does not check for 
		else 
		{
			if(testProject.ProjectID == '')
			{
				console.log("Project ID cannot be empty");
				return Promise.reject();
			}
			if(testProject.SubjectIDinProject == '')
			{
				console.log("Subject ID in Project cannot be empty");
				return Promise.reject();
			}

			//check project duplicate (if each subject has assigned an unique inProject ID)
			var SubjectIDEntered = [];

			//check if the subject has already been added (according to global ID)
			var GlobalIDEntered = [];

			//console.log(SubjectIDEntered);
			for (var num in testSubjects)
			{
				SubjectIDEntered.push(testSubjects[num].inProjectID);
				GlobalIDEntered.push(testSubjects[num].GlobalID);
			}
			//console.log(SubjectIDEntered);
			if (checkIfUniqueArray(SubjectIDEntered) == false){
				console.log ("Subject ID in each project must be unique!");
				return Promise.reject(err);
			}
			if (checkIfUniqueArray(GlobalIDEntered) == false){
				console.log ("This subject has already been added!");
				return Promise.reject(err);
			}
		}

		return Promise.resolve(testSubjects);
	})
	.then(function(testSubjects){
		console.log("add a new subject or add a project to existing subjects");
		var theSubject = require('./subjects');
		return theSubject.updateOrAddSubject(project.ProjectID, testSubjects);
	})
	.catch(function(err){
		console.log(err);
		console.log("Error with adding in new subjects");
		return Promise.reject();
	})
	.then (function() {
		return Project.createAsync(project);
	});
}

//update a project
module.exports.updateProject = function(id, project, options){
	return Promise.resolve().then(function () {
		// check your data
		var testProject = new Project(project);
		var error = testProject.validateSync();
		//console.log(error);
		var testSubjects = testProject.SubjectsID;
		//console.log(testSubjects);

		//check schema error
		if (error != undefined)
		{
			if ((error.errors['ProjectID'] != undefined) &&
				(error.errors['ProjectID'].message) == "Path `ProjectID` is required.")
			{
				console.log('Project ID must not be empty!');
			}

			if ((error.errors['ProjectName'] != undefined) &&
				(error.errors['ProjectName'].message) == "Path `ProjectName` is required.")
			{
				console.log('Please enter the project name!');
			}


			return Promise.reject();
		}

		//check other errors mongoose does not check for 
		else 
		{
			//check project duplicate
			var SubjectIDEnteredP = [];
			var SubjectIDEnteredG = [];
			//console.log(SubjectIDEntered);
			for (var num in testSubjects)
			{
				SubjectIDEnteredP.push(testSubjects[num].inProjectID);
				SubjectIDEnteredG.push(testSubjects[num].GlobalID);
			}
			//console.log(SubjectIDEntered);
			if (checkIfUniqueArray(SubjectIDEnteredP) == false){
				console.log ("Subject ID in each project must be unique!");
				return Promise.reject();
			}
			if (checkIfUniqueArray(SubjectIDEnteredG) == false){
				console.log ("Subject can only enter the project once!");
				return Promise.reject();
			}
		}

		return Promise.resolve();
	})
	.then(function () {
		// construct query and update database
		var query = {ProjectID:id};
		var update = {
			"ProjectID": project.ProjectID,
			"ProjectName": project.ProjectName,
			"SubjectsID": project.SubjectsID
		};
		var option = {runValidators: true, context: 'query'};
		return Project.findOneAndUpdateAsync(query, update, option);
	});
}

//delete a project
module.exports.deleteProject = function(id){
	return Promise.resolve().then(function(){
		//check
		//console.log(Subject);
		return Promise.resolve();
	}).then (function (){
		var query = {ProjectID:id};
		return Project.findOneAsync(query);
	})

	//find the project that we want to delete
	.then(function(project){
		
		if (project.SubjectsID != null)
		{
			//go through all the subjects in the lab and delete the project from the 'ProjectsEnrolled' list
			var subjectsID = project.SubjectsID;
			var projectID = project.ProjectID;

			var theSubject = require("./subjects");
			//console.log(theSubject);
			return theSubject.deleteProject(projectID, subjectsID);
		}

		//if no subject in the project
		else
		{
			return Promise.resolve();
		}
		
		
	})
	.catch(function(err){
		console.log(err);
		console.log("error with Subject.deleteProject");
		return Promise.reject();
	})
	.then(function(){
		var query = {ProjectID:id};
		return Project.removeAsync(query);
	});
}

//add a subject to project.SubjectsID list
module.exports.addSubject = function(id, subject, globalID){
	return Promise.resolve().then (function (){
		//check data
		return Promise.all(
			//for each project in the added subject, perform following function
			id.map(
				function (ID, ind) {

					//find the project document 
					var subjectID = subject[ind];
					return Project.findOneAsync({ProjectID:ID})
					.then(function (project){
				 		
				 		//add user inputed subjectID to the project.SubjectsID list
				 		var temp_inProjectIDs = (project.SubjectsID).map(function (a) {return a.inProjectID;});

				 		(temp_inProjectIDs).push(subjectID);

				 		//check if this array is unique, if not, show that it is not
				 		//and reject to prevent it from adding
				 		if (checkIfUniqueArray(temp_inProjectIDs) == false) {
				 			console.log(subjectID + " already exists in project " + ID +"!");
				 			var err = new Error ("subject exist error");
				 			return Promise.reject(err);
				 		}
		 				return Promise.resolve();
		 			})

		 			//if any error occur in finding the project document
		 			.catch(function(err){
		 				//console.log(err);

		 				//check the error message to see if user added any project that does not exist
		 				if(err == "TypeError: Cannot read property 'SubjectsID' of null")
		 				{
		 					console.log("Project " +ID+
		 					 " does not exist. Please create the project on the 'Projects' page.");
		 				}
		 				return Promise.reject(err);
		 			})
	 				.then(function(){
						var theScanSession = require('./scanSessions');
						var newScanObject = {
							SubjectID:globalID, 
							SubjectIDinProject:subject[ind], 
							relatedProject: ID,
							ScanSessions:[{SessionID:subject[ind]+"_A", MEGScans:[], MRIScans:[], TestResults:[]}]
						};
						return theScanSession.addScanSession(newScanObject);
					})
					.catch(function(err){
						console.log("can't add scan session + "+err);
					})
				}
			)
		);
	})
	
	//if everything is alright up to this point, add subject to the project list
	.then(function (){
		console.log("add subject to project list");
		for (var num in id)
		{
			var query = {ProjectID: id[num]};
			var update = {$addToSet: {SubjectsID: {GlobalID: globalID, inProjectID: subject[num]}}};
			var options = {upsert:true};
			Project.updateAsync(query, update, options);
		}
		return Promise.resolve();
	})
	.catch(function(err){
		console.log(err);
		console.log("error with adding subject to project list");
		return Promise.reject(err);	
	});
}


module.exports.updateSubject = function(globalID, oldsubject, newsubject){
	return Promise.resolve().then (function (){
		//check data
		return Promise.resolve();
	})
	.then(function (){

		//form a new array contain all information about the projects that need to be changed
		console.log(oldsubject);
		console.log(newsubject);
		var updatedArray = formUpdatedSubjectArray(oldsubject, newsubject);
		console.log(updatedArray);

		//go through each project that needs to be modified
		return Promise.all(
			updatedArray.map(function(curProject, ind){
				var projectID = curProject.projectID;
				var curID = curProject.newsubjectID;

				//find a project
				return Project.findOneAsync({ProjectID: projectID})
				.then (function(project){
					{
						var ID = curProject.projectID;
						//create old subject object
						var tobeReplaced = {GlobalID:globalID,inProjectID:curProject.oldsubjectID};
						//create new subject object
						var replace = {GlobalID:globalID, inProjectID:curProject.newsubjectID};

						console.log(ID, tobeReplaced,replace);

						//subjectID in project exists, update subjectID
						//update the scan session collection too
						if ((tobeReplaced.inProjectID!= null) && (replace.inProjectID!=null))
						{
							//exclude the updated ID itself, compare with other IDs
							var subjectPIDs = (project.SubjectsID).map(function(a){return a.inProjectID});
							var index = subjectPIDs.indexOf(tobeReplaced.inProjectID);
							subjectPIDs.splice(index, 1, curID);

							if(checkIfUniqueArray(subjectPIDs)==false)
							{
								console.log("This ID already exists in project, please give a new in-Project ID!");
								return Promise.reject("This ID already exists in project, please give a new in-Project ID!");
							}
							else
							{
								var query = {ProjectID:ID, "SubjectsID.GlobalID":tobeReplaced.GlobalID};
								var update ={$set: {'SubjectsID.$.inProjectID': replace.inProjectID}};

								var theScanSession = require('./scanSessions');
								var newSession = {
									SubjectID: replace.GlobalID,
									relatedProject: ID,
									SubjectIDinProject: replace.inProjectID
								};
								
								theScanSession.updateScanSessionBasicInfo(ID, tobeReplaced.inProjectID, newSession)
								.catch(function(err){
									console.log(err);
									return Promise.reject();
								})

							}
							
						}
						
						//old subjectID in project does not exist, add subjectID
						else if (tobeReplaced.inProjectID == null)
						{
							var subjectPIDs = (project.SubjectsID).map(function(a){return a.inProjectID});
							subjectPIDs.push(curID);

							if(checkIfUniqueArray(subjectPIDs)==false)
							{
								console.log("This ID already exists in project, please give a new in-Project ID!");
								return Promise.reject("This ID already exists in project, please give a new in-Project ID!");
							}
							else
							{
								var query = {ProjectID:ID};
								var update ={$addToSet: {'SubjectsID': replace}};
								
								var theScanSession = require('./scanSessions');
								var newScanObject = {
									SubjectID:globalID, 
									SubjectIDinProject:replace.inProjectID, 
									relatedProject: ID,
									ScanSessions:[{SessionID:replace.inProjectID +'_A', MEGScans:[], MRIScans:[], TestResults:[]}]
								};
								console.log("new ob" + newScanObject.ScanSessions + " " + newScanObject.SubjectIDinProject);
								theScanSession.addScanSession(newScanObject)
								.catch(function(err){
									console.log(err);
									return Promise.reject();
								})
							}
							
						}

						//new subjectID does not exist, subjectID has been removed from the project
						else if(replace.inProjectID == null)
						{
							var query = {ProjectID:ID};
							var update ={$pull: {'SubjectsID': tobeReplaced}};

							var theScanSession = require('./scanSessions');

							theScanSession.deleteEntireScanSessionByinProjectID(tobeReplaced.inProjectID)
							.catch(function(err){
								console.log(err);
								return Promise.reject();
							})

						}

						Project.updateAsync(query, update);
					}
					return Promise.resolve();

				})
				.catch(function(err){
					console.log("cannot find project + " + err);
					return Promise.reject(err);
				})
			})

		)

		/*for (var num in updatedArray)
		{
			var ID = updatedArray[num].projectID;
			//create old subject object
			var tobeReplaced = {GlobalID:globalID,inProjectID:updatedArray[num].oldsubjectID};
			//create new subject object
			var replace = {GlobalID:globalID, inProjectID:updatedArray[num].newsubjectID};

			console.log(ID, tobeReplaced,replace);

			//subjectID in project exists, update subjectID
			if ((tobeReplaced.inProjectID!= null) && (replace.inProjectID!=null))
			{
				var query = {ProjectID:ID, "SubjectsID.GlobalID":tobeReplaced.GlobalID};
				var update ={$set: {'SubjectsID.$.inProjectID': replace.inProjectID}};
			}
			
			//old subjectID in project does not exist, add subjectID
			else if (tobeReplaced.inProjectID == null)
			{
				var query = {ProjectID:ID};
				var update ={$addToSet: {'SubjectsID': replace}};
			}

			//new subjectID does not exist, subjectID has been removed from the project
			else if(replace.inProjectID == null)
			{
				var query = {ProjectID:ID};
				var update ={$pull: {'SubjectsID': tobeReplaced}};
			}

			Project.updateAsync(query, update);
		}*/


		//return Promise.resolve();
	})
	.then(function(){
		return Promise.resolve();
	})
	.catch(function(err){
		console.log("hi");
		return Promise.reject(err);
	});	
}


module.exports.deleteSubject = function(globalID, id, subject, options){
	return Promise.resolve().then (function (){
		//check data
		return Promise.resolve();
	}).then(function (){
		//console.log("called");
		for (var num in id)
		{
			var testSubject = {GlobalID:globalID,inProjectID:subject[num]};
			var query = {ProjectID:id[num]};
			var update ={$pull: {SubjectsID : testSubject}};
			Project.findOneAndUpdateAsync(query, update, options);
		}

		return Promise.resolve();
	});	
}


//========================== search ===========================================

module.exports.getProjectsOfMatchingID = function(userInput){
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
		return Project.findAsync({ProjectID:{$regex:".*" + userInput + ".*", $options:'i'}});
	});	
}


module.exports.getProjectsOfMatchingName = function(userInput){
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
		return Project.findAsync({ProjectName:{$regex:".*" + userInput + ".*", $options:'i'}});
	});	
}



function checkIfUniqueArray (array){
	return array.length === new Set(array).size;
}

function formUpdatedSubjectArray (oldsubject, newsubject){


	var updatedArray = [];
	var olen = oldsubject.length;
	var nlen = newsubject.length;

	//run the old subjects object array
	for (var i = 0; i < olen; i++){
		var oldID = oldsubject[i].projectID;
		//check all documents in the new subject list
		for (var j = 0; j<nlen; j++){
			//console.log(newsubject[j]);
			var newID = (newsubject[j]).projectID;
			//if there is a match, add to the updated list
			if(newID == oldID)
			{
				updatedArray.push({
					projectID: oldsubject[i].projectID,
					oldsubjectID: oldsubject[i].subjectID,
					newsubjectID: newsubject[j].subjectID
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
				projectID: oldsubject[i].projectID,
				oldsubjectID: oldsubject[i].subjectID,
				newsubjectID: null
			});
		}
	}

	//console.log("done old array");
	//run the new subjects version2 object array, this for loop accounts for the newly added projects
	var nlen2 = newsubject.length;
	for (var i=0; i<nlen2; i++){
		var newID = newsubject[i].projectID;
		if(newsubject[i].used == false)
		{
			updatedArray.push({
			projectID: newsubject[i].projectID,
			oldsubjectID: null,
			newsubjectID: newsubject[i].subjectID
			});
		}
		
	}

	return updatedArray;
}