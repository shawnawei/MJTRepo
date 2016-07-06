var Promise = require('bluebird');
var mongoose = require('mongoose');
Promise.promisifyAll(mongoose);
var Schema = mongoose.Schema;
var scanSessions = require('./scanSessions');


//MEGScanType schema
var MRIScanTypeSchema = new Schema({

	"TypeID": {type: String, required:true},
	"TypeName": {type: String, required:true},
	"Desc": String,
	"Comment":String
});


var MRIScanTypes = module.exports = mongoose.model('MRIScanTypes', MRIScanTypeSchema, 'MRIScanTypes');

//get all projects
module.exports.getMRIScanTypes = function(){
	return Promise.resolve().then(function() {
		return MRIScanTypes.findAsync();
	});
}

//get one test type
module.exports.getMRIByType = function(type){
	return Promise.resolve().then(function() {
		return MRIScanTypes.findOneAsync({TypeID:type});
	});
}


//add a new test type
module.exports.addMRIType = function(newMRIType){
return Promise.resolve().then(function () {
		// check your data
		var test = new MRIScanTypes(newMRIType);
		var error = test.validateSync();
		console.log(error);
		//check schema error
		if (error != undefined)
		{
			if ((error.errors['TypeID'] != undefined) &&
				(error.errors['TypeID'].message) == "Path `TypeID` is required.")
			{
				console.log('Type ID must not be empty!');
			}

			if ((error.errors['TypeName'] != undefined) &&
				(error.errors['TypeName'].message) == "Path `TypeName` is required.")
			{
				console.log('Type name must not be empty!');
			}

			return Promise.reject();
		}

		return Promise.resolve();
	})
	.then(function () {
		
		console.log("add mri type");
		console.log(newMRIType);
		return MRIScanTypes.createAsync(newMRIType);
	});
}



//edit one test type
module.exports.editMRIType = function(type, newMRIType){
return Promise.resolve().then(function () {
		// check your data
		var test = new MRIScanTypes(newMRIType);
		var error = test.validateSync();

		//check schema error
		if (error != undefined)
		{
			if ((error.errors['TypeName'] != undefined) &&
				(error.errors['TypeName'].message) == "Path `TypeName` is required.")
			{
				console.log('Type name must not be empty!');
			}

			return Promise.reject();
		}

		return Promise.resolve();
	})
	.then(function () {
		// construct query and update database
		var query = {TypeID:type};
		var update = {
			"TypeID": newMRIType.TypeID,
			"TypeName": newMRIType.TypeName,
			"Desc": newMRIType.Desc,
			"Comment": newMRIType.Comment
		};
		var option = {runValidators: true, context: 'query'};
		return MRIScanTypes.findOneAndUpdateAsync(query, update, option);
	});
}

//remove a test type
module.exports.deleteMRIType = function(type){
	return Promise.resolve().then (function (){
		//check data
		return Promise.resolve();
	})
	.then(function (){
		var query = {TypeID:type};
		return MRIScanTypes.removeAsync(query);
	});	
}