var Promise = require('bluebird');
var mongoose = require('mongoose');
Promise.promisifyAll(mongoose);
var Schema = mongoose.Schema;
var uniqueValidator = require('mongoose-unique-validator');


//authen user schema
var UserSchema = new Schema({

	"uid": {type: String, required:true, unique:true},
	"Type": String,
	"Comment":String
});


UserSchema.plugin(uniqueValidator);
var AuthenList = module.exports = mongoose.model('AuthenList', UserSchema, 'userList');

//get all registered users on the list
module.exports.getAllUsers = function(){
	return Promise.resolve().then(function() {
		return AuthenList.findAsync();
	});
}

//get one user's information
module.exports.getUser = function(user){
	return Promise.resolve().then(function() {
		return AuthenList.findOneAsync({uid:user});
	});
}


//add a new user
module.exports.addUser = function(newUser){
return Promise.resolve().then(function () {
		// check your data
		var test = new AuthenList(newUser);
		var error = test.validateSync();
		console.log(error);
		//check schema error
		if (error != undefined)
		{
			if ((error.errors['uid'] != undefined) &&
				(error.errors['uid'].message) == "Path `uid` is required.")
			{
				console.log('User uid must not be empty!');
			}

			return Promise.reject();
		}

		return Promise.resolve();
	})
	.then(function () {
		
		console.log(newUser);
		return AuthenList.createAsync(newUser);
	});
}



//edit one user
module.exports.editUser = function(useruid, newUserInfo){
return Promise.resolve().then(function () {
		// check your data
		var test = new AuthenList(newUserInfo);
		var error = test.validateSync();
		console.log("enter function " + useruid, newUserInfo, error);
		//check schema error
		if (error != undefined)
		{
			if ((error.errors['uid'] != undefined) &&
				(error.errors['uid'].message) == "Path `uid` is required.")
			{
				console.log('uid must not be empty!');
			}

			return Promise.reject();
		}

		return Promise.resolve();
	})
	.then(function () {

		console.log(useruid, newUserInfo);
		// construct query and update database
		var query = {uid:useruid};
		var update = {
			"uid": newUserInfo.uid,
			"Type": newUserInfo.Type,
			"Comment": newUserInfo.Comment
		};
		var option = {runValidators: true, context: 'query'};
		return AuthenList.findOneAndUpdateAsync(query, update, option);
	});
}

//remove user`s record
module.exports.deleteUser = function(_uid){
	return Promise.resolve().then (function (){
		//check data
		return Promise.resolve();
	})
	.then(function (){
		var query = {uid:_uid};
		return AuthenList.removeAsync(query);
	});	
}