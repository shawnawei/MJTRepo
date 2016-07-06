var Promise = require('bluebird');
var mongoose = require('mongoose');
Promise.promisifyAll(mongoose);
var Schema = mongoose.Schema;
var uniqueValidator = require('mongoose-unique-validator');
//var theSubject = require ('./subjects');
var scanSessions = require('./scanSessions');


//testType schema
var TestTypeSchema = new Schema({

	"TestID": {type: String, required:true},
	"TestName": {type: String, required:true},
	"TestDesc": {type: String},
	"Comment":String
});


TestTypeSchema.plugin(uniqueValidator);
var TestTypes = module.exports = mongoose.model('TestTypes', TestTypeSchema, 'testTypes');

//get all test types
module.exports.getTestTypes = function(){
	return Promise.resolve().then(function() {
		return TestTypes.findAsync();
	});
}

//get one test type
module.exports.getTestTypeByType = function(type){
	return Promise.resolve().then(function() {
		return TestTypes.findOneAsync({TestName:type});
	});
}


//add a new test type
module.exports.addTestType = function(newTestType){
return Promise.resolve().then(function () {
		// check your data
		var test = new TestTypes(newTestType);
		var error = test.validateSync();

		//check schema error
		if (error != undefined)
		{
			if ((error.errors['TestID'] != undefined) &&
				(error.errors['TestID'].message) == "Path `TestID` is required.")
			{
				console.log('Test ID must not be empty!');
			}

			if ((error.errors['TestName'] != undefined) &&
				(error.errors['TestName'].message) == "Path `TestName` is required.")
			{
				console.log('Test name must not be empty!');
			}

			return Promise.reject();
		}

		return Promise.resolve();
	})
	.then(function () {
		
		console.log("add test type");
		console.log(newTestType);
		return TestTypes.createAsync(newTestType);
	});
}



//edit one test type
module.exports.editTestTypeByType = function(type, newTestType){
return Promise.resolve().then(function () {
		// check your data
		var test = new TestTypes(newTestType);
		var error = test.validateSync();

		//check schema error
		if (error != undefined)
		{
			if ((error.errors['TestName'] != undefined) &&
				(error.errors['TestName'].message) == "Path `TestName` is required.")
			{
				console.log('Test name must not be empty!');
			}

			return Promise.reject();
		}

		return Promise.resolve();
	})
	.then(function () {
		// construct query and update database
		var query = {TestID:type};
		var update = {
			"TestID": newTestType.TestID,
			"TestName": newTestType.TestName,
			"TestDesc": newTestType.TestDesc,
			"Comment": newTestType.Comment
		};
		var option = {runValidators: true, context: 'query'};
		return TestTypes.findOneAndUpdateAsync(query, update, option);
	});
}

//remove a test type
module.exports.deleteTestTypeByType = function(type){
	return Promise.resolve().then (function (){
		//check data
		return Promise.resolve();
	})
	.then(function (){
		var query = {TestID:type};
		return TestTypes.removeAsync(query);
	});	
}