var Promise = require('bluebird');
var mongoose = require('mongoose');
Promise.promisifyAll(mongoose);
var Schema = mongoose.Schema;
var uniqueValidator = require('mongoose-unique-validator');
//var theSubject = require ('./subjects');
var scanSessions = require('./scanSessions');


//MEGScanType schema
var MEGScanTypeSchema = new Schema({

	"TypeID": {type: String, required:true, unique:true},
	"TypeName": {type: String, required:true, unique: true},
	"TypeCateg":{type: String, required:true},
	"Desc": {type: String},
	"Comment":String
});


MEGScanTypeSchema.plugin(uniqueValidator);
var MEGScanTypes = module.exports = mongoose.model('MEGScanTypes', MEGScanTypeSchema, 'MEGScanTypes');

//get all projects
module.exports.getMEGScanTypes = function(){
	return Promise.resolve().then(function() {
		return MEGScanTypes.findAsync();
	});
}

//get one test type
module.exports.getMEGByType = function(type){
	return Promise.resolve().then(function() {
		return MEGScanTypes.findOneAsync({_id:type});
	});
}


//add a new test type
module.exports.addMEGType = function(newMEGType){
return Promise.resolve().then(function () {
		// check your data
		var test = new MEGScanTypes(newMEGType);
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
		
		console.log("add meg type");
		console.log(newMEGType);
		return MEGScanTypes.createAsync(newMEGType);
	});
}



//edit one test type
module.exports.editMEGType = function(type, newMEGType){
return Promise.resolve().then(function () {
		// check your data
		var test = new MEGScanTypes(newMEGType);
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
			"TypeID": newMEGType.TypeID,
			"TypeName": newMEGType.TypeName,
			"Desc": newMEGType.Desc,
			"Comment": newMEGType.Comment
		};
		var option = {runValidators: true, context: 'query'};
		return MEGScanTypes.findOneAndUpdateAsync(query, update, option);
	});
}

//remove a test type
module.exports.deleteMEGType = function(type){
	return Promise.resolve().then (function (){
		//check data
		return Promise.resolve();
	})
	.then(function (){
		var query = {TypeID:type};
		return MEGScanTypes.removeAsync(query);
	});	
}