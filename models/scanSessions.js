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
		"ScanDate": String,
		"ScanPath": String,
		"Allowed": Boolean,
		"ScanType": {type: String, ref:'MEGScanTypes'},
		"AgeAtScan": Number,
		"Comment": String
	}],

	"MRIScans": [{
		"ScanName": String,
		"ScanDate": String,
		"ScanPath": String,
		"Allowed": Boolean,
		"ScanType": {type: String, ref:'MRIScanTypes'},
		"AgeAtScan": Number,
		"Comment": String
	}],

	"TestResults":[{
		"Type": {type:String, ref:'TestTypes'},
		"Result": Number,
		"Comment": String,
		"TestDate": String,
		"Age": Number
	}]

});

//list of all subject sessions
var ScanSessionsSchema = new Schema({
	"SubjectID": {type: String, required: true, ref: 'Subject'},
	"relatedProject": {type: String, ref:'Project'},
	"SubjectIDinProject": {type: String, unique: true, required: true, ref:'Project'},
	"AccessAuthen": [{
		"uid":{type: String, required: true, ref:'AuthenList'},
		"ViewOnly": {type: Boolean}
	}],
	"ScanSessions": [SessionIDSchema],
});

ScanSessionsSchema.plugin(uniqueValidator);
SessionIDSchema.plugin(uniqueValidator);
var ScanSession = module.exports = mongoose.model('scanSession', ScanSessionsSchema, 'scanSessions');

//get all authorized sessions
module.exports.getScanSessions = function(uid){
	return Promise.resolve()
	.then(function (){
		var query = {
			'AccessAuthen.uid': {$in:[uid, 'AllUsers', 'AllUser']}
		};
		return ScanSession.findAsync(query);
	});
}

//get all sessions
module.exports.getAllScanSessions = function(){
	return Promise.resolve()
	.then(function (){
		var query = {
		};
		return ScanSession.findAsync(query);
	});
}

//get one session by subject ID in project
module.exports.getScanSessionBySubjectIDinProject = function(projectID, subjectID, _uid){
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
			{$match: {
				$and: [
				{relatedProject: projectID},
				{SubjectIDinProject: subjectID},
				{"AccessAuthen.uid":{$in: [_uid, 'AllUser', 'AllUsers']}}
				]}
			}
		];


		// var query = {
		// 	relatedProject: projectID, 
		// 	SubjectIDinProject: subjectID,
		// 	'AccessAuthen.uid': {$in:[_uid, 'AllUsers', 'AllUser']}
		// };
		return ScanSession.aggregateAsync(query);
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
module.exports.getScanSessionBySessionID = function(projectID, subjectID, scanID, uid){
	return Promise.resolve().then(function (){
		//check
		return Promise.resolve();
	})
	.then(function () {
		var query = {
			SubjectIDinProject: subjectID, 
			relatedProject: projectID,
			'AccessAuthen.uid': {$in:[uid, 'AllUsers', 'AllUser']}
		};
		return ScanSession.findOneAsync(query, {ScanSessions: {$elemMatch:{SessionID: scanID}}});
	});
}


//get all scan sessions for one project
module.exports.getScanSessionByProjectID = function(projectID, uid){
	return Promise.resolve().then(function (){
		//check
		return Promise.resolve();
	})
	.then(function () {
		// var query = {
		// 	relatedProject: projectID,
		// 	'AccessAuthen.uid': {$in:[uid, 'AllUsers', 'AllUser']}
		// };

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
			{$match: {
				$and: [
				{relatedProject: projectID},
				{"AccessAuthen.uid":{$in: [uid, 'AllUser', 'AllUsers']}}
				]}
			}
		];
		return ScanSession.aggregateAsync(query);
	});
}

//add scan sessions
module.exports.addScanSession = function(scanSession, uid){
	return Promise.resolve().then(function(){
		var testSession = new ScanSession(scanSession);
		var error = testSession.validateSync();
		//console.log(scanSession);
		//console.log("HELLO" + error + scanSession);
		
		if (error != undefined)
		{
			if ((error.errors['SubjectID'] != undefined) &&
				(error.errors['SubjectID'].message) == "Path `SubjectID` is required.")
			{
				//console.log('Please enter the Subject ID!');
				var err = 'Please enter the Subject ID!';
			}

			if ((error.errors['SubjectIDinProject'] != undefined) &&
				(error.errors['SubjectIDinProject'].message) == "Path `SubjectIDinProject` is required.")
			{
				//console.log('Please enter the in Subject ID in project!');
				var err = 'Please enter the in Subject ID in project!';
			}

			if ((error.errors['SessionID'] != undefined) &&
				(error.errors['SessionID'].message) == "Path `SessionID` is required.")
			{
				//console.log('Please enter the ID of this scan session!');
				var err = 'Please enter the ID of this scan session!';
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
	})
	.then(function(scanSession){
		var changelog = require('./changelog');
		var changeinfo = {DocType: 'ScanSessions', ChangeType: 'add', DocID: scanSession.SubjectIDinProject};
		var newDoc = scanSession;
		var oldDoc = 'addnew';
		changelog.addChange(uid, oldDoc, newDoc, changeinfo);
		return Promise.resolve(scanSession);
	})
}

//edit a scan session document (only update the basic information)
//no scan session info updated, only update subjectID, inprojectID and related project
module.exports.updateScanSessionBasicInfo = function(projectID, subjectID, scanSession){
	return Promise.resolve()
	.then(function(){
		//check update data
		var testSession = new ScanSession(scanSession);
		var error = testSession.validateSync();
		//console.log(error);

		if (error != undefined)
		{
			if ((error.errors['SubjectIDinProject'] != undefined) &&
				(error.errors['ProjectID'].message) == "Path `SubjectIDinProject` is required.")
			{
				//console.log('SubjectIDinProject is required!');
				return Promise.reject("SubjectIDinProject is required!");
			}

			if ((error.errors['SessionID'] != undefined) &&
				(error.errors['SessionID'].message) == "Path `SessionID` is required.")
			{
				//console.log('Session ID for this scan session is required!');
				return Promise.reject("Session ID for this scan session is required!");
			}

		}
		return Promise.resolve();
	})
	.then(function(){
		var query = {SubjectIDinProject:subjectID, relatedProject: projectID};
		var update = {
			SubjectID: scanSession.SubjectID,
			relatedProject: scanSession.relatedProject,
			SubjectIDinProject: scanSession.SubjectIDinProject,
			AccessAuthen: scanSession.AccessAuthen
		};
		var option = {runValidators: true, context: 'query', multi:true};
		return ScanSession.updateAsync(query, update, option);
	})
	.catch(function(err){
		console.log("some error with user updated scan + " + err);
		return Promise.reject(err);
	});
	
}



//edit a scan session document (all of the sessions)
module.exports.updateScanSession = function(projectID, subjectID, scanSession){
	return Promise.resolve()
	.then(function(){
		//check update data
		var testSession = new ScanSession(scanSession);
		var error = testSession.validateSync();
		//console.log(error);

		if (error != undefined)
		{
			if ((error.errors['SubjectIDinProject'] != undefined) &&
				(error.errors['ProjectID'].message) == "Path `SubjectIDinProject` is required.")
			{
				//console.log('SubjectIDinProject is required!');
				return Promise.reject("SubjectIDinProject is required!");
			}

			if ((error.errors['SessionID'] != undefined) &&
				(error.errors['SessionID'].message) == "Path `SessionID` is required.")
			{
				//console.log('Session ID for this scan session is required!');
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
module.exports.updateSingleScanSession = function(OldScanSession, subjectID, sessionID, scanSession,uid){
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
			//console.log("The session ID you entered already exists!");
			return Promise.reject("The session ID you entered already exists!");
		}

		if(newScanID == '')
		{
			//console.log("Session ID must not be empty");
			return Promise.reject("Session ID must not be empty");
		}
		
		//get old session information
		var oldDoc = OldScanSession.ScanSessions[index];

		console.log(oldDoc);
		return Promise.resolve(oldDoc);
	})
	
	.then(function(oldDoc){
		var subject = require('./subjects');
		var globalID = OldScanSession.SubjectID;
		var projectID = OldScanSession.relatedProject;
		return subject.updateSingleScanInSubject(globalID, subjectID, projectID, sessionID, scanSession,
		 oldDoc, uid); 
	})
	.catch(function(err){
		console.log("some error with user updated scan + " + err);
		return Promise.reject(err);
	});
}

//add a single scan session
module.exports.addSingleScanSession = function(oldScanSession, GlobalID, projectID, inProjectID, scanSession, uid){
	return Promise.resolve().then(function(){
		//check user inputed scan Session information 
	
		return Promise.resolve();
	})
	.then(function(){
		var subject = require('./subjects'); 
		return subject.findOneAsync({ID:GlobalID});
	})
	.then(function(subject){
		//console.log(subject);
		var bday = subject.DateOfBirth;
		//console.log(bday);
		calculate_age_at_scan_and_test(scanSession, bday);

		//console.log("inhere", scanSession);
		var query = {SubjectIDinProject:inProjectID};
		var update = {$addToSet:{'ScanSessions':scanSession}};
		return ScanSession.updateAsync(query, update);
	})
	.then(function(){
		var query = {
			SubjectIDinProject: inProjectID, 
			relatedProject: projectID};
		return ScanSession.findOneAsync(query);
	})
	.then(function(newScanSession){

		console.log(newScanSession);
		var allsessions = newScanSession.ScanSessions;
		for (var num in allsessions)
		{
			if (allsessions[num].SessionID == scanSession.SessionID)
			{
				var newsession = allsessions[num];
			}
		}

		console.log(newsession);

		var changelog = require('./changelog');
		var changeinfo = {DocType: 'SingleSession', ChangeType: 'add_session', DocID: newsession.SessionID};
		var newDoc = newsession;
		var oldDoc = 'addnew';
		changelog.addChange(uid, oldDoc, newDoc, changeinfo);

		var newandold = [];
		newandold.push(oldScanSession);
		newandold.push(newScanSession)
		return Promise.resolve(newandold);
	})
	
}


//delete a single scan session
module.exports.deleteScanSession = function(uid, GlobalID, projectID, subjectID, scanID){
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
		var query = {SubjectIDinProject:subjectID, 'ScanSessions.SessionID': scanID};
		var update = {$pull: {'ScanSessions':{SessionID: scanID}}};
		return ScanSession.updateAsync(query, update);
	})
	.then(function(){
		var query = {
			SubjectIDinProject: subjectID, 
			relatedProject: projectID};
		return ScanSession.findOneAsync(query);
	})
	.then(function(oldScanSession){

		console.log(oldScanSession);
		// var allsessions = oldScanSession.ScanSessions;
		// for (var num in allsessions)
		// {
		// 	if (allsessions[num].SessionID == scanID)
		// 	{
		// 		var oldsession = allsessions[num];
		// 	}
		// }

		// console.log(oldsession);

		var changelog = require('./changelog');
		var changeinfo = {DocType: 'ScanSessions', ChangeType: 'delete_session', 
						DocID: oldScanSession.SubjectIDinProject, DeletedSessionID: scanID};
		var newDoc = 'deletesession';
		var oldDoc = oldScanSession;
		changelog.addChange(uid, oldDoc, newDoc, changeinfo);
		return Promise.resolve(oldScanSession);
	})
	.catch(function(err){
		console.log("error with deleting scan " + err);
		return Promise.reject("error with deleting scan " + err);
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
module.exports.getScanSessionByMatchingSubjectIDinProject = function(subjectID, _uid){
	return Promise.resolve().then(function (){
		//check
		return Promise.resolve();
	})
	.then(function () {
		var query = {
			SubjectIDinProject:{$regex:".*" + subjectID + ".*", $options:'i'},
			"AccessAuthen.uid":{$in: [_uid, 'AllUser', 'AllUsers']}
		};

		return ScanSession.findAsync(query);
	});
}

//get one session by subject's in project ID
module.exports.findSubjectByinProjectID = function(subjectID, _uid){
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
		{$match: {
			$and: [
			{SubjectIDinProject:{$regex:".*" + subjectID + ".*", $options:'i'}},
			{"AccessAuthen.uid":{$in: [_uid, 'AllUser', 'AllUsers']}}
			]}
		},
		{$project:{
			'_id':0,
			'relatedProject': 1,
			'SubjectIDinProject': 1,
			'SubjectID': 1,
			'SubjectInfo': 1 
			}
		},
		{$unwind: '$SubjectInfo'}
		];

		return ScanSession.aggregateAsync(query);
	});
}

//get one session by subject's in project ID
module.exports.getScanSessionBySubjectIDinProjectOnly = function(subjectID, _uid){
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
		{$match: {
			$and: [
				{SubjectIDinProject: {$regex:".*" + subjectID + ".*", $options:'i'}},
				{'AccessAuthen.uid': {$in:[_uid, 'AllUsers', 'AllUser']}} 
			]}
		}
		];
		return ScanSession.aggregateAsync(query);
	});
}


//get all session for one subject
module.exports.searchScanSessionBySubjectID = function(id, _uid){
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
			{$match: {
				$and: [
					{SubjectID: {$regex:".*" + id + ".*", $options:'i'}},
					{'AccessAuthen.uid': {$in:[_uid, 'AllUsers', 'AllUser']}} 
				]}
		}
		];
		return ScanSession.aggregateAsync(query);
	});
}

//get scan sessions by sessionID
module.exports.searchScanSessionBySessionID = function(sessionID, _uid){
	return Promise.resolve().then(function (){
		//check
		return Promise.resolve();
	})
	.then(function () {
		var query = queryScanSessionID(sessionID, _uid);

		return ScanSession.aggregateAsync(query);
	});
}


//get all sessions for matching informations
module.exports.searchScanSessionsByInfo = function(scanInfo, _uid){
	return Promise.resolve().then(function (){
		//check
		return Promise.resolve();
	})
	.then(function () {
		//console.log(scanInfo);

		var query = queryScanInfo(scanInfo, _uid);
		//console.log(query);

		return ScanSession.aggregateAsync(query);
	});
}



//=========================== OTHER FUNCTIONS =============================


function checkIfUniqueArray (array){
	return array.length === new Set(array).size;
}


function queryScanSessionID (sessionID, _uid){

	
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
	{$match: {
			$and: [
				{'ScanSessions.SessionID': {$regex:".*" + sessionID + ".*", $options:'i'}},
				{'AccessAuthen.uid': {$in:[_uid, 'AllUsers', 'AllUser']}} 
			]}
		}
	];

	return query;
}



function queryScanInfo (scanInfo, _uid){

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
		//console.log(maxAge, minAge, allowed, testType, Projects, SubjectGID, SubjectPID);


		if (MEGType[0] == 'None')
		{
			var query = [
			{$unwind:'$ScanSessions'},
			{$match:
				{$and: [
					{'relatedProject':{$in: Projects}},
					{'AccessAuthen.uid': {$in:[_uid, 'AllUsers', 'AllUser']}}
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


				'ScanSessions.TestResults':{
					$filter:{
						input:"$ScanSessions.TestResults",
						as:'tests',
						cond:{$and:[
							{$lte: ['$$tests.Age',maxAge]}, 
							{$gte: ['$$tests.Age',minAge]}
							]
						}
					}
				},
				
				'_id':0,
				'ScanSessions.SessionID': 1,
				'relatedProject': 1,
				'SubjectIDinProject': 1,
				'SubjectID': 1 }
			},

			{$unwind: {path:'$ScanSessions.MRIScans', preserveNullAndEmptyArrays: true}},
			{$match:
				{$or: [
					{'ScanSessions.MRIScans.ScanType': {$in:MRIType}},
					{'ScanSessions.MRIScans': {$exists: false}}
					]
				}
			},
			{$unwind:{path:'$ScanSessions.TestResults', preserveNullAndEmptyArrays: true}},
			{$match:
				{$or: [
					{'ScanSessions.TestResults': {$exists: false}},
					{'ScanSessions.TestResults.Type': {$in:testType}}
					]
				}
			},
			{$match:
				{$or: [
					{'ScanSessions.TestResults': {$ne: null}},
					{'ScanSessions.MEGScans': {$ne: null}},
					{'ScanSessions.MRIScans': {$ne: null}}
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
					{'relatedProject':{$in: Projects}},
					{'AccessAuthen.uid': {$in:[_uid, 'AllUsers', 'AllUser']}}
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

				'ScanSessions.TestResults':{
					$filter:{
						input:"$ScanSessions.TestResults",
						as:'tests',
						cond:{$and:[
							{$lte: ['$$tests.Age',maxAge]}, 
							{$gte: ['$$tests.Age',minAge]}
							]
						}
					}
				},
				
				'_id':0,
				'ScanSessions.SessionID': 1,
				//'ScanSessions.TestResults': 1,
				'relatedProject': 1,
				'SubjectIDinProject': 1,
				'SubjectID': 1 }
			},

			{$unwind:{path:'$ScanSessions.MEGScans', preserveNullAndEmptyArrays: true}},
			{$match:
				{$and: [
					{'ScanSessions.MEGScans': {$exists: false}},
					{'ScanSessions.MEGScans.ScanType': {$in:MEGType}}
					]
				}
			},
			{$unwind:{path:'$ScanSessions.TestResults', preserveNullAndEmptyArrays: true}},
			{$match:
				{$and: [
					{'ScanSessions.TestResults': {$exists: false}},
					{'ScanSessions.TestResults.Type': {$in:testType}}
					]
				}
			},

			{$match:
				{$or: [
					{'ScanSessions.TestResults': {$ne: null}},
					{'ScanSessions.MEGScans': {$ne: null}},
					{'ScanSessions.MRIScans': {$ne: null}}
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
					{'relatedProject':{$in: Projects}},
					{'AccessAuthen.uid': {$in:[_uid, 'AllUsers', 'AllUser']}}
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

					'ScanSessions.TestResults':{
					
					$filter:{
						input:"$ScanSessions.TestResults",
						as:'tests',
						cond:{
							$and:[
							{$lte: ['$$tests.Age',maxAge]}, 
							{$gte: ['$$tests.Age',minAge]}

							]
						}
					}
				},


				'_id':0,
				'ScanSessions.SessionID': 1,
				//'ScanSessions.TestResults': 1,
				'relatedProject': 1,
				'SubjectIDinProject': 1,
				'SubjectID': 1 }
			},

			{$unwind: {path:'$ScanSessions.MEGScans', preserveNullAndEmptyArrays: true}},
			// {$project: {
		 //        'ScanSessions.MEGScans': { $ifNull: [ "ScanSessions.MEGScans", []] ] }
		 //        }
		 //    },
			{$match:
				{$or: [
					{'ScanSessions.MEGScans': {$exists: false}},
					{'ScanSessions.MEGScans.ScanType': {$in:MEGType}}
					]
				}
			},

			{$unwind: {path: '$ScanSessions.MRIScans', preserveNullAndEmptyArrays: true}},
			{$match:
				{$or: [
					{'ScanSessions.MRIScans.ScanType': {$in:MRIType}},
					{'ScanSessions.MRIScans': {$exists: false}}
					]
				}
			},

			{$unwind: {path:'$ScanSessions.TestResults', preserveNullAndEmptyArrays: true}},
			{$match:
				{$or: [
					{'ScanSessions.TestResults': {$exists: false}},
					{'ScanSessions.TestResults.Type': {$in:testType}}
					]
				}
			},
			{$match:
				{$or: [
					{'ScanSessions.TestResults': {$ne: null}},
					{'ScanSessions.MEGScans': {$ne: null}},
					{'ScanSessions.MRIScans': {$ne: null}}
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
	

	else if (scanInfo.Allowed == 'All')
	{
		//console.log(maxAge, minAge, allowed, Projects, SubjectGID, SubjectPID);


		if (MEGType[0] == 'None')
		{
			var query = [
			{$unwind:'$ScanSessions'},
			{$match:
				{$and: [
					{'relatedProject':{$in: Projects}},
					{'AccessAuthen.uid': {$in:[_uid, 'AllUsers', 'AllUser']}}
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

				'ScanSessions.TestResults':{
					$filter:{
						input:"$ScanSessions.TestResults",
						as:'tests',
						cond:{$and:[
							{$lte: ['$$tests.Age',maxAge]}, 
							{$gte: ['$$tests.Age',minAge]}
							]
						}
					}
				},
				
				'_id':0,
				'ScanSessions.SessionID': 1,
				//'ScanSessions.TestResults': 1,
				'relatedProject': 1,
				'SubjectIDinProject': 1,
				'SubjectID': 1 }
			},

			{$unwind:{path:'$ScanSessions.MRIScans', preserveNullAndEmptyArrays: true}},
			{$match:
				{$or: [
					{'ScanSessions.MRIScans.ScanType': {$in:MRIType}},
					{'ScanSessions.MRIScans': {$exists: false}}
					]
				}
			},
			{$unwind: {path:'$ScanSessions.TestResults', preserveNullAndEmptyArrays: true}},
			{$match:
				{$or: [
					{'ScanSessions.TestResults': {$exists: false}},
					{'ScanSessions.TestResults.Type': {$in:testType}}
					]
				}
			},

			{$match:
				{$or: [
					{'ScanSessions.TestResults': {$ne: null}},
					{'ScanSessions.MEGScans': {$ne: null}},
					{'ScanSessions.MRIScans': {$ne: null}}
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
					{'relatedProject':{$in: Projects}},
					{'AccessAuthen.uid': {$in:[_uid, 'AllUsers', 'AllUser']}}
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

					'ScanSessions.TestResults':{
					$filter:{
						input:"$ScanSessions.TestResults",
						as:'tests',
						cond:{$and:[
							{$lte: ['$$tests.Age',maxAge]}, 
							{$gte: ['$$tests.Age',minAge]}
							]
						}
					}
				},
				
				'_id':0,
				'ScanSessions.SessionID': 1,
				//'ScanSessions.TestResults': 1,
				'relatedProject': 1,
				'SubjectIDinProject': 1,
				'SubjectID': 1 }
			},

			{$unwind:{path:'$ScanSessions.MEGScans', preserveNullAndEmptyArrays: true}},
			{$match:
				{$or: [
					{'ScanSessions.MEGScans.ScanType': {$in:MEGType}},
					{'ScanSessions.MEGScans': {$exists: false}}
					]
				}
			},
			{$unwind: {path:'$ScanSessions.TestResults', preserveNullAndEmptyArrays: true}},
			{$match:
				{$or: [
					{'ScanSessions.TestResults.Type': {$in:testType}},
					{'ScanSessions.TestResults': {$exists: false}}
					]
				}
			},
			{$match:
				{$or: [
					{'ScanSessions.TestResults': {$ne: null}},
					{'ScanSessions.MEGScans': {$ne: null}},
					{'ScanSessions.MRIScans': {$ne: null}}
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
					{'relatedProject':{$in: Projects}},
					{'AccessAuthen.uid': {$in:[_uid, 'AllUsers', 'AllUser']}}
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

					'ScanSessions.TestResults':{
					
					$filter:{
						input:"$ScanSessions.TestResults",
						as:'tests',
						cond:{
							$and:[
							{$lte: ['$$tests.Age',maxAge]}, 
							{$gte: ['$$tests.Age',minAge]}

							]
						}
					}
				},


				'_id':0,
				'ScanSessions.SessionID': 1,
				//'ScanSessions.TestResults': 1,
				'relatedProject': 1,
				'SubjectIDinProject': 1,
				'SubjectID': 1 }
			},

			{$unwind: {path:'$ScanSessions.MEGScans', preserveNullAndEmptyArrays: true}},
			// {$project: {
		 //        'ScanSessions.MEGScans': { $ifNull: [ "ScanSessions.MEGScans", []] ] }
		 //        }
		 //    },
			{$match:
				{$or: [
					{'ScanSessions.MEGScans': {$exists: false}},
					{'ScanSessions.MEGScans.ScanType': {$in:MEGType}}
					]
				}
			},

			{$unwind: {path: '$ScanSessions.MRIScans', preserveNullAndEmptyArrays: true}},
			{$match:
				{$or: [
					{'ScanSessions.MRIScans.ScanType': {$in:MRIType}},
					{'ScanSessions.MRIScans': {$exists: false}}
					]
				}
			},

			{$unwind: {path:'$ScanSessions.TestResults', preserveNullAndEmptyArrays: true}},
			{$match:
				{$or: [
					{'ScanSessions.TestResults': {$exists: false}},
					{'ScanSessions.TestResults.Type': {$in:testType}}
					]
				}
			},
			{$match:
				{$or: [
					{'ScanSessions.TestResults': {$ne: null}},
					{'ScanSessions.MEGScans': {$ne: null}},
					{'ScanSessions.MRIScans': {$ne: null}}
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






function calculate_age_at_scan_and_test(scanSession, subjectbirthday){
	//console.log("birthday" + subjectBirthday);
	var subjectBirthday = moment(subjectbirthday);
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
					var testage = null;
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
						var megage = null;
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
					var mriage = null;
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

function getBool(val) {
    return !!JSON.parse(String(val).toLowerCase());
}





