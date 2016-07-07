var Promise = require('bluebird');
var mongoose = require('mongoose');
var moment = require('moment');
Promise.promisifyAll(mongoose);
var Schema = mongoose.Schema;
var uniqueValidator = require('mongoose-unique-validator');

//scan session schema
var SessionIDSchema = new Schema({
	"SessionID": {type: String, required: true},
	"ParticipantAge": {
		type: Number, 
		min: 0,
		max: 100
	},

	"MEGScans": [{
		"ScanName": String,
		"ScanDate": Date,
		"ScanPath": String,
		"Allowed": Boolean,
		"ScanType": {type: String, ref:'MEGScanTypes'},
		"AgeAtScan": Number,
		"Comment": String
	}],

	"MRIScans": [{
		"ScanName": String,
		"ScanDate": Date,
		"ScanPath": String,
		"Allowed": Boolean,
		"ScanType": {type: String, ref:'MRIScanTypes'},
		"AgeAtScan": Number,
		"Comment": String
	}],

	"TestResults":[{
		"Type": {type:String, ref:'TestTypes'},
		"Result": String,
		"Comment": String,
		"TestDate": Date,
		"Age": Number
	}]

});

//list of all subject sessions
var ScanSessionsSchema = new Schema({
	"SubjectID": {type: String, required: true, ref: 'Subject'},
	"relatedProject": {type: String, ref:'Project'},
	"SubjectIDinProject": {type: String, unique: true, required: true, ref:'Project'},
	"ScanSessions": [SessionIDSchema],
});

ScanSessionsSchema.plugin(uniqueValidator);
SessionIDSchema.plugin(uniqueValidator);
var ScanSession = module.exports = mongoose.model('scanSession', ScanSessionsSchema, 'scanSessions');

//get all sessions
module.exports.getScanSessions = function(){
	return Promise.resolve()
	.then(function (){
		return ScanSession.findAsync();
	});
}

//get one session by subject ID in project
module.exports.getScanSessionBySubjectIDinProject = function(projectID, subjectID){
	return Promise.resolve().then(function (){
		//check
		return Promise.resolve();
	}).then(function () {
		return ScanSession.findOneAsync({relatedProject: projectID, SubjectIDinProject: subjectID});
	});
}


//get all session for one subject
module.exports.getScanSessionBySubjectID = function(id){
	return Promise.resolve().then(function (){
		//check
		return Promise.resolve();
	})
	.then(function () {
		return ScanSession.findAsync({SubjectID: id});
	});
}

//get one session by the session ID
module.exports.getScanSessionBySessionID = function(projectID, subjectID, scanID){
	return Promise.resolve().then(function (){
		//check
		return Promise.resolve();
	})
	.then(function () {
		var query = {SubjectIDinProject: subjectID, relatedProject: projectID};
		return ScanSession.findOneAsync(query, {ScanSessions: {$elemMatch:{SessionID: scanID}}});
	});
}

//add scan sessions
module.exports.addScanSession = function(scanSession){
	return Promise.resolve().then(function(){
		var testSession = new ScanSession(scanSession);
		var error = testSession.validateSync();
		console.log(scanSession);
		console.log("HELLO" + error + scanSession);
		
		if (error != undefined)
		{
			if ((error.errors['SubjectID'] != undefined) &&
				(error.errors['SubjectID'].message) == "Path `SubjectID` is required.")
			{
				console.log('Please enter the Subject ID!');
			}

			if ((error.errors['SubjectIDinProject'] != undefined) &&
				(error.errors['SubjectIDinProject'].message) == "Path `SubjectIDinProject` is required.")
			{
				console.log('Please enter the in Subject ID in project!');
			}

			if ((error.errors['SessionID'] != undefined) &&
				(error.errors['SessionID'].message) == "Path `SessionID` is required.")
			{
				console.log('Please enter the ID of this scan session!');
			}


			return Promise.reject();
		}

		else
		{
			//other checks
		}

		return Promise.resolve();
	})
	.then (function(){
		return ScanSession.createAsync(scanSession);
	});
}

//edit a scan session document (only update the basic information)
//no scan session info updated, only update subjectID, inprojectID and related project
module.exports.updateScanSessionBasicInfo = function(projectID, subjectID, scanSession){
	return Promise.resolve()
	.then(function(){
		//check update data
		var testSession = new ScanSession(scanSession);
		var error = testSession.validateSync();
		console.log(error);

		if (error != undefined)
		{
			if ((error.errors['SubjectIDinProject'] != undefined) &&
				(error.errors['ProjectID'].message) == "Path `SubjectIDinProject` is required.")
			{
				console.log('SubjectIDinProject is required!');
				return Promise.reject("SubjectIDinProject is required!");
			}

			if ((error.errors['SessionID'] != undefined) &&
				(error.errors['SessionID'].message) == "Path `SessionID` is required.")
			{
				console.log('Session ID for this scan session is required!');
				return Promise.reject("Session ID for this scan session is required!");
			}

		}
		return Promise.resolve();
	})
	.catch(function(err){
		console.log("some error with user updated scan + " + err);
		return Promise.reject(err);
	})
	.then(function(){
		var query = {SubjectIDinProject:subjectID, relatedProject: projectID};
		var update = {
			SubjectID: scanSession.SubjectID,
			relatedProject: scanSession.relatedProject,
			SubjectIDinProject: scanSession.SubjectIDinProject
		};
		var option = {runValidators: true, context: 'query'};
		return ScanSession.findOneAndUpdateAsync(query, update, option);
	});
	
}



//edit a scan session document (all of the sessions)
module.exports.updateScanSession = function(projectID, subjectID, scanSession){
	return Promise.resolve()
	.then(function(){
		//check update data
		var testSession = new ScanSession(scanSession);
		var error = testSession.validateSync();
		console.log(error);

		if (error != undefined)
		{
			if ((error.errors['SubjectIDinProject'] != undefined) &&
				(error.errors['ProjectID'].message) == "Path `SubjectIDinProject` is required.")
			{
				console.log('SubjectIDinProject is required!');
				return Promise.reject("SubjectIDinProject is required!");
			}

			if ((error.errors['SessionID'] != undefined) &&
				(error.errors['SessionID'].message) == "Path `SessionID` is required.")
			{
				console.log('Session ID for this scan session is required!');
				return Promise.reject("Session ID for this scan session is required!");
			}

		}
		return Promise.resolve();
	})
	.catch(function(err){
		console.log("some error with user updated scan + " + err);
		return Promise.reject(err);
	})
	.then(function(){
		var query = {SubjectIDinProject:subjectID, relatedProject: projectID};
		var update = {
			SubjectID: scanSession.SubjectID,
			relatedProject: scanSession.relatedProject,
			SubjectIDinProject: scanSession.SubjectIDinProject,
			ScanSessions: scanSession.ScanSessions
		};
		var option = {runValidators: true, context: 'query'};
		return ScanSession.findOneAndUpdateAsync(query, update, option);
	});
	
}

//edit a single scan session
module.exports.updateSingleScanSession = function(OldScanSession, subjectID, sessionID, scanSession){
	return Promise.resolve()
	.then(function(){
		
		//check update data
		var scanIDs = (OldScanSession.ScanSessions).map(function(a){return a.SessionID;});
		var newScanID = scanSession.SessionID;
		var index = scanIDs.indexOf(sessionID);
		scanIDs.splice(index,1);
		scanIDs.push(newScanID);

		if (checkIfUniqueArray(scanIDs) == false)
		{
			console.log("The session ID you entered already exists!");
			return Promise.reject("The session ID you entered already exists!");
		}

		if(newScanID == '')
		{
			console.log("Session ID must not be empty");
			return Promise.reject("Session ID must not be empty");
		}

		return Promise.resolve();
	})
	.catch(function(err){
		console.log("some error with user updated scan + " + err);
		return Promise.reject(err);
	})
	.then(function(){
		var subject = require('./subjects');
		var globalID = OldScanSession.SubjectID;
		var projectID = OldScanSession.relatedProject;
		return subject.updateSingleScanInSubject(globalID, subjectID, projectID, sessionID, scanSession); 
	})
	
}

//add a single scan session
module.exports.addSingleScanSession = function(GlobalID, projectID, inProjectID, scanSession){
	return Promise.resolve().then(function(){
		//check user inputed scan Session information 
	
		return Promise.resolve();
	})
	// .then(function(){
	// 	//update the subject detail page
	// 	var subject = require('./subjects'); 
	// 	return subject.addSubjectScanSession(GlobalID, projectID, scanSession);
	// })
	// .catch(function(err){
	// 	console.log(err + "error with updating subject detail page");
	// 	return Promise.reject(err);
	// })
	.then(function(){
		var subject = require('./subjects'); 
		return subject.findOneAsync({ID:GlobalID});
	})
	.then(function(subject){
		console.log(subject);
		var bday = subject.DateOfBirth;
		console.log(bday);
		calculate_age_at_scan_and_test(scanSession, bday);

		console.log("inhere", scanSession);
		var query = {SubjectIDinProject:inProjectID};
		var update = {$addToSet:{'ScanSessions':scanSession}};
		return ScanSession.updateAsync(query, update);
	});
	
}


//delete a single scan session
module.exports.deleteScanSession = function(GlobalID, projectID, subjectID, scanID){
	return Promise.resolve()
	// .then(function(){
	// 	console.log(scanID);
	// 	return Promise.resolve();
	// })
	// .then(function(){
	// 	var subject = require('./subjects');
	// 	return subject.deleteSingleScanInSubject(GlobalID, projectID, scanID);
	// })
	// .catch(function(err){
	// 	console.log("error with delete from subject page + " + err);
	// 	return Promise.reject(err);
	// })
	.then(function(){
		console.log("hi");
		var query = {SubjectIDinProject:subjectID, 'ScanSessions.SessionID': scanID};
		var update = {$pull: {'ScanSessions':{SessionID: scanID}}};
		return ScanSession.updateAsync(query, update);
	})
	.catch(function(err){
		console.log("error with deleting scan " + err);
		return Promise.reject();
	})
	
}

module.exports.deleteEntireScanSession = function(subjectID){
	return Promise.resolve()
	.then(function(){
		return Promise.resolve();
	})
	.then(function(){
		var query = {SubjectID:subjectID};
		return ScanSession.removeAsync(query);
	})
}

module.exports.deleteEntireScanSessionByinProjectID = function(subjectID){
	return Promise.resolve()
	.then(function(){
		return Promise.resolve();
	})
	.then(function(){
		var query = {SubjectIDinProject:subjectID};
		return ScanSession.removeAsync(query);
	})
}






//============================ Search ===================================

//get one session by subject's in project ID
module.exports.getScanSessionByMatchingSubjectIDinProject = function(subjectID){
	return Promise.resolve().then(function (){
		//check
		return Promise.resolve();
	})
	.then(function () {
		return ScanSession.findAsync({SubjectIDinProject:{$regex:".*" + subjectID + ".*", $options:'i'}});
	});
}

//get one session by subject's in project ID
module.exports.getScanSessionBySubjectIDinProjectOnly = function(subjectID){
	return Promise.resolve().then(function (){
		//check
		return Promise.resolve();
	})
	.then(function () {
		var query = [
		{$lookup:
			{
				from:'subjectsList',
				localField: 'SubjectID',
				foreignField: 'ID',
				as:"SubjectInfo"
			}
		},
		{$unwind: '$SubjectInfo'},
		{$unwind: '$ScanSessions'},
		{$match: {SubjectIDinProject: {$regex:".*" + subjectID + ".*", $options:'i'}}}
		];
		return ScanSession.aggregateAsync(query);
	});
}


//get all session for one subject
module.exports.searchScanSessionBySubjectID = function(id){
	return Promise.resolve().then(function (){
		//check
		return Promise.resolve();
	})
	.then(function () {
		var query = [
			{$lookup:
			{
				from:'subjectsList',
				localField: 'SubjectID',
				foreignField: 'ID',
				as:"SubjectInfo"
			}
			},
			{$unwind: '$SubjectInfo'},
			{$unwind: '$ScanSessions'},
			{$match: {SubjectID: {$regex:".*" + id + ".*", $options:'i'}}}
		];
		return ScanSession.aggregateAsync(query);
	});
}

//get scan sessions by sessionID
module.exports.searchScanSessionBySessionID = function(sessionID){
	return Promise.resolve().then(function (){
		//check
		return Promise.resolve();
	})
	.then(function () {
		console.log("sessionID" + sessionID);

		var query = queryScanSessionID(sessionID);

		return ScanSession.aggregateAsync(query);
	});
}


//get all sessions for matching informations
module.exports.searchScanSessionsByInfo = function(scanInfo){
	return Promise.resolve().then(function (){
		//check
		return Promise.resolve();
	})
	.then(function () {
		console.log(scanInfo);

		var query = queryScanInfo(scanInfo);
		console.log(query);

		return ScanSession.aggregateAsync(query);
	});
}



//=========================== OTHER FUNCTIONS =============================


function checkIfUniqueArray (array){
	return array.length === new Set(array).size;
}


function queryScanSessionID (sessionID){

	
	if (sessionID == 'All')
	{
		sessionID = '';
	}
	var query = [
	{$lookup:
		{
			from:'subjectsList',
			localField: 'SubjectID',
			foreignField: 'ID',
			as:"SubjectInfo"
		}
	},
	{$unwind: '$SubjectInfo'},
	{$unwind: '$ScanSessions'},
	{$match:
		{'ScanSessions.SessionID':
			{$regex:".*" + sessionID + ".*", $options:'i'}
		}
	}
	];

	return query;
}



function queryScanInfo (scanInfo){

	var ageRange = scanInfo.AgeRange;
	var maxAge = +ageRange[1];
	var minAge = +ageRange[0];
	var MEGType = scanInfo.MEGType;
	var MRIType = scanInfo.MRIType;
	var testType = scanInfo.testType;
	var Projects = scanInfo.Projects;
	var SubjectGID = scanInfo.SubjectGID;
	var SubjectPID = scanInfo.SubjectPID
	

	if (scanInfo.Allowed != 'All')
	{
		var allowed = getBool(scanInfo.Allowed);
		console.log(maxAge, minAge, allowed, testType, Projects, SubjectGID, SubjectPID);


		if (MEGType[0] == 'None')
		{
			var query = [
			{$unwind:'$ScanSessions'},
			{$match:
				{$and: [
					{'relatedProject':{$in: Projects}}
					]
				}
			},
			{$match:
				{$or: [
					{'SubjectID': {$in: SubjectGID}},
					{'SubjectIDinProject':{$in: SubjectPID}}
				]} 

			},
			{$project:{

				'ScanSessions.MRIScans':{
					$filter:{
						input:"$ScanSessions.MRIScans",
						as:'scans',
						cond:{$and:[
							{$lte: ['$$scans.AgeAtScan',maxAge]}, 
							{$gte: ['$$scans.AgeAtScan',minAge]},
							{$eq: ['$$scans.Allowed', allowed]}
							]
						}
					}
				},
				
				'_id':0,
				'ScanSessions.SessionID': 1,
				'ScanSessions.TestResults': 1,
				'relatedProject': 1,
				'SubjectIDinProject': 1,
				'SubjectID': 1 }
			},

			{$unwind:'$ScanSessions.MRIScans'},
			{$match:
				{$and: [
					{'ScanSessions.MRIScans.ScanType': {$in:MRIType}}
					]
				}
			},
			{$unwind:'$ScanSessions.TestResults'},
			{$match:
				{$and: [
					{'ScanSessions.TestResults.Type': {$in:testType}}
					]
				}
			},

			{$lookup:
				{
					from:'subjectsList',
					localField: 'SubjectID',
					foreignField: 'ID',
					as:"SubjectInfo"
				}

			},

			{$group:
				{
					_id:{
						"SessionID":'$ScanSessions.SessionID', 
						"relatedProject":'$$ROOT.relatedProject',
						"SubjectIDinProject":'$$ROOT.SubjectIDinProject',
						"SubjectID":'$$ROOT.SubjectID',
						"SubjectInfo":'$$ROOT.SubjectInfo'
					},
					'MRIScans':{$addToSet:"$ScanSessions.MRIScans"},
					'TestResults':{$addToSet: "$ScanSessions.TestResults"}
				}
				
			},
			
			{$unwind:'$_id.SubjectInfo'}

			];
		}

		if (MRIType[0] == 'None')
		{

			var query = [
			{$unwind:'$ScanSessions'},
			{$match:
				{$and: [
					{'relatedProject':{$in: Projects}}
					]
				}
			},
			{$match:
				{$or: [
					{'SubjectID': {$in: SubjectGID}},
					{'SubjectIDinProject':{$in: SubjectPID}}
				]} 

			},
			{$project:{

				'ScanSessions.MEGScans':{
						$filter:{
							input:"$ScanSessions.MEGScans",
							as:'scans',
							cond:{$and:[
								{$lte: ['$$scans.AgeAtScan',maxAge]}, 
								{$gte: ['$$scans.AgeAtScan',minAge]},
								{$eq: ['$$scans.Allowed', allowed]}
								]}
						},
					},
				
				'_id':0,
				'ScanSessions.SessionID': 1,
				'ScanSessions.TestResults': 1,
				'relatedProject': 1,
				'SubjectIDinProject': 1,
				'SubjectID': 1 }
			},

			{$unwind:'$ScanSessions.MEGScans'},
			{$match:
				{$and: [
					{'ScanSessions.MEGScans.ScanType': {$in:MEGType}}
					]
				}
			},
			{$unwind:'$ScanSessions.TestResults'},
			{$match:
				{$and: [
					{'ScanSessions.TestResults.Type': {$in:testType}}
					]
				}
			},

			{$lookup:
				{
					from:'subjectsList',
					localField: 'SubjectID',
					foreignField: 'ID',
					as:"SubjectInfo"
				}

			},

			{$group:
				{
					_id:{
						"SessionID":'$ScanSessions.SessionID', 
						"relatedProject":'$$ROOT.relatedProject',
						"SubjectIDinProject":'$$ROOT.SubjectIDinProject',
						"SubjectID":'$$ROOT.SubjectID',
						"SubjectInfo":'$$ROOT.SubjectInfo'
					},
					'MEGScans':{$addToSet:"$ScanSessions.MEGScans"},
					'TestResults':{$addToSet: "$ScanSessions.TestResults"}
				}
				
			},
			
			{$unwind:'$_id.SubjectInfo'}

			];

		}

		else if (MEGType[0] != 'None' && MRIType[0] != 'None')
		{

			var query = [
			{$unwind:'$ScanSessions'},
			{$match:
				{$and: [
					{'relatedProject':{$in: Projects}}
					]
				}
			},
			{$match:
				{$or: [
					{'SubjectID': {$in: SubjectGID}},
					{'SubjectIDinProject':{$in: SubjectPID}}
				]} 

			},
			{$project:{

				'ScanSessions.MEGScans':{
						$filter:{
							input:"$ScanSessions.MEGScans",
							as:'scans',
							cond:{$and:[
								{$lte: ['$$scans.AgeAtScan',maxAge]}, 
								{$gte: ['$$scans.AgeAtScan',minAge]},
								{$eq: ['$$scans.Allowed', allowed]}
								]}
						},
					},

					'ScanSessions.MRIScans':{
						$filter:{
							input:"$ScanSessions.MRIScans",
							as:'scans',
							cond:{$and:[
								{$lte: ['$$scans.AgeAtScan',maxAge]}, 
								{$gte: ['$$scans.AgeAtScan',minAge]},
								{$eq: ['$$scans.Allowed', allowed]}
								]
							}
						}
					},
				
				'_id':0,
				'ScanSessions.SessionID': 1,
				'ScanSessions.TestResults': 1,
				'relatedProject': 1,
				'SubjectIDinProject': 1,
				'SubjectID': 1 }
			},

			{$unwind:'$ScanSessions.MEGScans'},
			{$match:
				{$and: [
					{'ScanSessions.MEGScans.ScanType': {$in:MEGType}}
					]
				}
			},
			{$unwind:'$ScanSessions.MRIScans'},
			{$match:
				{$and: [
					{'ScanSessions.MRIScans.ScanType': {$in:MRIType}}
					]
				}
			},

			{$unwind:'$ScanSessions.TestResults'},
			{$match:
				{$and: [
					{'ScanSessions.TestResults.Type': {$in:testType}}
					]
				}
			},
			
			{$lookup:
				{
					from:'subjectsList',
					localField: 'SubjectID',
					foreignField: 'ID',
					as:"SubjectInfo"
				}

			},

			{$group:
				{
					_id:{
						"SessionID":'$ScanSessions.SessionID', 
						"relatedProject":'$$ROOT.relatedProject',
						"SubjectIDinProject":'$$ROOT.SubjectIDinProject',
						"SubjectID":'$$ROOT.SubjectID',
						"SubjectInfo":'$$ROOT.SubjectInfo'
					},
					'MEGScans':{$addToSet:"$ScanSessions.MEGScans"},
					'MRIScans':{$addToSet:"$ScanSessions.MRIScans"},
					'TestResults':{$addToSet: "$ScanSessions.TestResults"}
				}
				
			},

			{$unwind:'$_id.SubjectInfo'}
			]

		}
				
	}
	

	else if (scanInfo.Allowed == 'All')
	{
		console.log(maxAge, minAge, allowed, Projects, SubjectGID, SubjectPID);


		if (MEGType[0] == 'None')
		{
			var query = [
			{$unwind:'$ScanSessions'},
			{$match:
				{$and: [
					{'relatedProject':{$in: Projects}}
					]
				}
			},
			{$match:
				{$or: [
					{'SubjectID': {$in: SubjectGID}},
					{'SubjectIDinProject':{$in: SubjectPID}}
				]} 

			},
			{$project:{

				'ScanSessions.MRIScans':{
					$filter:{
						input:"$ScanSessions.MRIScans",
						as:'scans',
						cond:{$and:[
							{$lte: ['$$scans.AgeAtScan',maxAge]}, 
							{$gte: ['$$scans.AgeAtScan',minAge]}
							]
						}
					}
				},
				
				'_id':0,
				'ScanSessions.SessionID': 1,
				'ScanSessions.TestResults': 1,
				'relatedProject': 1,
				'SubjectIDinProject': 1,
				'SubjectID': 1 }
			},

			{$unwind:'$ScanSessions.MRIScans'},
			{$match:
				{$and: [
					{'ScanSessions.MRIScans.ScanType': {$in:MRIType}}
					]
				}
			},
			{$unwind:'$ScanSessions.TestResults'},
			{$match:
				{$and: [
					{'ScanSessions.TestResults.Type': {$in:testType}}
					]
				}
			},

			{$lookup:
				{
					from:'subjectsList',
					localField: 'SubjectID',
					foreignField: 'ID',
					as:"SubjectInfo"
				}

			},

			{$group:
				{
					_id:{
						"SessionID":'$ScanSessions.SessionID', 
						"relatedProject":'$$ROOT.relatedProject',
						"SubjectIDinProject":'$$ROOT.SubjectIDinProject',
						"SubjectID":'$$ROOT.SubjectID',
						"SubjectInfo":'$$ROOT.SubjectInfo'
					},
					'MRIScans':{$addToSet:"$ScanSessions.MRIScans"},
					'TestResults':{$addToSet: "$ScanSessions.TestResults"}
				}
				
			},
			
			{$unwind:'$_id.SubjectInfo'}

			];
		}

		if (MRIType[0] == 'None')
		{

			var query = [
			{$unwind:'$ScanSessions'},
			{$match:
				{$and: [
					{'relatedProject':{$in: Projects}}
					]
				}
			},
			{$match:
				{$or: [
					{'SubjectID': {$in: SubjectGID}},
					{'SubjectIDinProject':{$in: SubjectPID}}
				]} 

			},
			{$project:{

				'ScanSessions.MEGScans':{
						$filter:{
							input:"$ScanSessions.MEGScans",
							as:'scans',
							cond:{$and:[
								{$lte: ['$$scans.AgeAtScan',maxAge]}, 
								{$gte: ['$$scans.AgeAtScan',minAge]}
								]}
						},
					},
				
				'_id':0,
				'ScanSessions.SessionID': 1,
				'ScanSessions.TestResults': 1,
				'relatedProject': 1,
				'SubjectIDinProject': 1,
				'SubjectID': 1 }
			},

			{$unwind:'$ScanSessions.MEGScans'},
			{$match:
				{$and: [
					{'ScanSessions.MEGScans.ScanType': {$in:MEGType}}
					]
				}
			},
			{$unwind:'$ScanSessions.TestResults'},
			{$match:
				{$and: [
					{'ScanSessions.TestResults.Type': {$in:testType}}
					]
				}
			},

			{$lookup:
				{
					from:'subjectsList',
					localField: 'SubjectID',
					foreignField: 'ID',
					as:"SubjectInfo"
				}

			},

			{$group:
				{
					_id:{
						"SessionID":'$ScanSessions.SessionID', 
						"relatedProject":'$$ROOT.relatedProject',
						"SubjectIDinProject":'$$ROOT.SubjectIDinProject',
						"SubjectID":'$$ROOT.SubjectID',
						"SubjectInfo":'$$ROOT.SubjectInfo'
					},
					'MEGScans':{$addToSet:"$ScanSessions.MEGScans"},
					'TestResults':{$addToSet: "$ScanSessions.TestResults"}
				}
				
			},
			
			{$unwind:'$_id.SubjectInfo'}

			];

		}

		else if (MEGType[0] != 'None' && MRIType[0] != 'None')
		{

			var query = [
			{$unwind:'$ScanSessions'},
			{$match:
				{$and: [
					{'relatedProject':{$in: Projects}}
					]
				}
			},
			{$match:
				{$or: [
					{'SubjectID': {$in: SubjectGID}},
					{'SubjectIDinProject':{$in: SubjectPID}}
				]} 

			},
			{$project:{

				'ScanSessions.MEGScans':{
						$filter:{
							input:"$ScanSessions.MEGScans",
							as:'scans',
							cond:{$and:[
								{$lte: ['$$scans.AgeAtScan',maxAge]}, 
								{$gte: ['$$scans.AgeAtScan',minAge]}
								]}
						},
					},

					'ScanSessions.MRIScans':{
						$filter:{
							input:"$ScanSessions.MRIScans",
							as:'scans',
							cond:{$and:[
								{$lte: ['$$scans.AgeAtScan',maxAge]}, 
								{$gte: ['$$scans.AgeAtScan',minAge]}
								]
							}
						}
					},
				
				'_id':0,
				'ScanSessions.SessionID': 1,
				'ScanSessions.TestResults': 1,
				'relatedProject': 1,
				'SubjectIDinProject': 1,
				'SubjectID': 1 }
			},

			{$unwind:'$ScanSessions.MEGScans'},
			{$match:
				{$and: [
					{'ScanSessions.MEGScans.ScanType': {$in:MEGType}}
					]
				}
			},
			{$unwind:'$ScanSessions.MRIScans'},
			{$match:
				{$and: [
					{'ScanSessions.MRIScans.ScanType': {$in:MRIType}}
					]
				}
			},

			{$unwind:'$ScanSessions.TestResults'},
			{$match:
				{$and: [
					{'ScanSessions.TestResults.Type': {$in:testType}}
					]
				}
			},
			
			{$lookup:
				{
					from:'subjectsList',
					localField: 'SubjectID',
					foreignField: 'ID',
					as:"SubjectInfo"
				}

			},

			{$group:
				{
					_id:{
						"SessionID":'$ScanSessions.SessionID', 
						"relatedProject":'$$ROOT.relatedProject',
						"SubjectIDinProject":'$$ROOT.SubjectIDinProject',
						"SubjectID":'$$ROOT.SubjectID',
						"SubjectInfo":'$$ROOT.SubjectInfo'
					},
					'MEGScans':{$addToSet:"$ScanSessions.MEGScans"},
					'MRIScans':{$addToSet:"$ScanSessions.MRIScans"},
					'TestResults':{$addToSet: "$ScanSessions.TestResults"}
				}
				
			},

			{$unwind:'$_id.SubjectInfo'}

			];

		}
				
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
				var testDate = moment(test[num].TestDate);
				var age = testDate.diff(subjectBirthday, 'years', true).toFixed(2);

				test[num].Age = age;
			}
		}


		//==== for meg scan ages =====
		if (megScans.length != 0)
		{
			for (var num in megScans)
			{
				if (megScans[num].ScanDate != null)
				{
					var testDate = moment(megScans[num].ScanDate);
					var age = testDate.diff(subjectBirthday, 'years', true).toFixed(2);
					megScans[num].AgeAtScan = age;
				}	
			}
		}

		//==== for mri scan ages =====
		if (mriScans.length != 0)
		{
			for (var num in mriScans)
			{
				var testDate = moment(mriScans[num].ScanDate);
				var age = testDate.diff(subjectBirthday, 'years', true).toFixed(2);

				mriScans[num].AgeAtScan = age;
			}
		}
	}
}

function getBool(val) {
    return !!JSON.parse(String(val).toLowerCase());
}





	/*var query = {'ScanSessions.SessionID': {$regex:".*" + sessionID + ".*", $options:'i'},
				 'ScanSessions.ParticipantAge':{$lte: maxAge, $gte:minAge}};

	var projection = {ScanSessions:{$elemMatch:{'ScanSessions.SessionID': {$regex:".*" + sessionID + ".*", $options:'i'},
				 'ScanSessions.ParticipantAge':{$lte: maxAge, $gte:minAge}}}};
	
	if (sessionID == 'All')
	{
		delete query['ScanSessions.SessionID'];
		projection = {ScanSessions:{$elemMatch: {'ParticipantAge':{$lte:maxAge, $gte:minAge}}}};
	}*/
	

/*{$project:
				{'ScanSessions.MEGScans':{
						$filter:{
							input:"$ScanSessions.MEGScans",
							as:'scans',
							cond:{$and:[
								{$eq: ['$$scans.Allowed', allowed]},
								{$lte: ['$$scans.AgeAtScan',maxAge]}, 
								{$gte: ['$$scans.AgeAtScan',minAge]}]}
						},
					},

					'ScanSessions.MRIScans':{
						$filter:{
							input:"$ScanSessions.MRIScans",
							as:'scans',
							cond:{$and:[
								{$eq: ['$$scans.Allowed', allowed]},
								{$lte: ['$$scans.AgeAtScan',maxAge]}, 
								{$gte: ['$$scans.AgeAtScan',minAge]}]}
						}
					},

					_id: 0,
					SubjectID:1,
					SubjectIDinProject:1,
					relatedProject:1
				},

			}*/