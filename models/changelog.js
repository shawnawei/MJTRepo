var Promise = require('bluebird');
var mongoose = require('mongoose');
Promise.promisifyAll(mongoose);
var Schema = mongoose.Schema;
var uniqueValidator = require('mongoose-unique-validator');
var enumDocType = ['Subjects', 'Projects', 'ScanSessions', 'SingleSession', 'User', 'MEGType', 'MRIType', 'TestType'];
var enumChangeType = ['add', 'add_session', 'delete', 'delete_session', 'update', 'update_session'];

//changelog schema
var ChangelogSchema = new Schema({

	"DocumentID": {type: String, required:true},
	"DocumentType":{type: String, enum: enumDocType},
	"ChangeType": {type: String, enum: enumChangeType},
	"ChangeDocID": String,
	"User": String,
	"Date": Date,
	"ChangedField":[Schema.Types.Mixed],
	"Comment":String
});


var Changelog = module.exports = mongoose.model('Changelog', ChangelogSchema, 'changelog');

//get all changes done
module.exports.getAllChanges = function(uid){
	return Promise.resolve().then(function() {
		return Changelog.findAsync();
	});
}

//get changes done to one document
module.exports.getChangeOfOne = function(documentID){
	return Promise.resolve().then(function() {
		return Changelog.findAsync({DocumentID: documentID});
	});
}

//get changes done to one document
module.exports.getChangeOfOne_scans = function(docType, documentID){
	return Promise.resolve().then(function() {
		return Changelog.findAsync({DocumentType: docType, ChangeDocID: documentID});
	});
}

//get changes by document type
module.exports.getChangeOfDocType = function(documentType){
	return Promise.resolve().then(function() {
		return Changelog.findAsync({DocumentType: documentType});
	});
}


//add a new change
module.exports.addChange = function(uid, oldDoc, newDoc, changeInfo){
	return Promise.resolve()
	.then(function(){

		//console.log(uid, oldDoc, newDoc, changeInfo);

		if (changeInfo.ChangeType == 'update_session' && changeInfo.DocType == 'SingleSession')
		{
			var newChange = newSessionChangeUpdate(uid, oldDoc, newDoc, changeInfo);
		}

		if (changeInfo.ChangeType == 'update' && changeInfo.DocType != 'ScanSessions')
		{
			var newChange = newChangeUpdate(uid, oldDoc, newDoc, changeInfo);
		}

		if (changeInfo.ChangeType == 'update' && changeInfo.DocType == 'ScanSessions')
		{
			var newChange = newScanChangeUpdate(uid, oldDoc, newDoc, changeInfo);
		}

		if (changeInfo.ChangeType == 'add' || changeInfo.ChangeType == 'add_session')
		{
			var newChange = newChangeAdd(uid, newDoc, changeInfo);
		}

		if (changeInfo.ChangeType == 'delete' && changeInfo.ChangeType != 'delete_session')
		{
			var newChange = newChangeDelete(uid, oldDoc, changeInfo);
		}

		if (changeInfo.ChangeType == 'delete' || changeInfo.ChangeType == 'delete_session')
		{
			var newChange = newScanChangeDelete(uid, oldDoc, changeInfo);
		}

		return Promise.resolve(newChange);
	})
	.then(function (newChange) {
		// check your data

		if (newChange != 'nochange')
		{
			var test = new Changelog(newChange);
			var error = test.validateSync();


			//check schema error
			if (error != undefined)
			{
				if ((error.errors['DocumentID'] != undefined) &&
					(error.errors['DocumentID'].message) == "Path `DocumentID` is required.")
				{
					console.log('Specify the document being changed!');
				}

				return Promise.reject("cannot add changelog");
			}

			return Promise.resolve(newChange);
		}
		else
		{
			return Promise.resolve("nochange");
		}
		
	})
	.then(function (newChange) {
		
		//return Promise.resolve();
		if (newChange != "nochange")
		{
			return Changelog.createAsync(newChange);
		}

		else
		{
			return Promise.resolve();
		}
		
	});
}


module.exports.deleteaChange = function(changeID){
	return Promise.resolve().then(function() {
		return Changelog.removeAsync({_id: changeID});
	});

}



function newChangeUpdate (uid, oldDoc, newDoc, changeInfo){

	var changedField = [];

		//make mongo documents into objects
		var oldDocObj = oldDoc.toObject();

		var oldDocFields = [];

		Object.keys(oldDocObj).forEach(function(key) {
		    oldDocFields.push({Key: key, Value: oldDocObj[key]});
		});

		for (var num in oldDocFields)
		{
			var tempkey = oldDocFields[num].Key;

			//check if this field exists for the new document and if the field is not an array
			if (newDoc[tempkey] != undefined 
				&& Object.prototype.toString.call( oldDocFields[num].Value ) != '[object Array]'
				&& Object.prototype.toString.call( oldDocFields[num].Value ) != '[object object]')
			{
				//check the value of this field in the new document, compare with old doc
				if (newDoc[tempkey] != oldDocFields[num].Value)
				{
					changedField.push({Key: tempkey, OldValue:oldDocFields[num].Value, NewValue:newDoc[tempkey]});
				}
			}


			//check if the field is an array
			if (newDoc[tempkey] != undefined 
				&& Object.prototype.toString.call( oldDocFields[num].Value ) == '[object Array]')
			{
				//check the value of this field in the new document, compare with old doc
				if (newDoc[tempkey] !== oldDocFields[num].Value)
				{
					for (var i in oldDocFields[num].Value)
					{
						if (oldDocFields[num].Value[i]._id)
						{
							delete oldDocFields[num].Value[i]._id;
						}
					}
					for (var j in newDoc[tempkey])
					{
						if (newDoc[tempkey][j]._id)
						{
							delete newDoc[tempkey][j]._id;
							if (newDoc[tempkey][j].used == true || newDoc[tempkey][j].used == false)
							{
								delete newDoc[tempkey][j].used;
							}
						}
					}


					var eq = (JSON.stringify(oldDocFields[num].Value) == JSON.stringify(newDoc[tempkey]));
					//console.log(eq);

					if (!eq)
					{
						changedField.push({Key: tempkey, OldValue:oldDocFields[num].Value, NewValue:newDoc[tempkey]});
					}
					
				}
			}


			//check if the field is an object
			if (newDoc[tempkey] != undefined 
				&& Object.prototype.toString.call( oldDocFields[num].Value ) == '[object object]')
			{
				//check the value of this field in the new document, compare with old doc
				if (newDoc[tempkey] != oldDocFields[num].Value)
				{
					changedField.push({Key: tempkey, OldValue:oldDocFields[num].Value, NewValue:newDoc[tempkey]});
				}
			}

		}


		var newChange = {
			"DocumentID": oldDocObj._id,
			"DocumentType": changeInfo.DocType,
			"ChangeType": changeInfo.ChangeType,
			"ChangeDocID": changeInfo.DocID,
			"User": uid,
			"Date": Date.now(),
			"ChangedField":changedField
		};

		console.log(changedField);

		if (changedField.length != 0)
		{
			return newChange;
		}

		else 
		{
			return "nochange";
		}

}

function newScanChangeUpdate (uid, oldDoc, newdoc, changeInfo){

	var changedField = [];

		//make mongo documents into objects
		var oldDocObj = oldDoc.toObject();
		var newDoc = newdoc.toObject();
		var oldDocFields = [];

		Object.keys(oldDocObj).forEach(function(key) {
		    oldDocFields.push({Key: key, Value: oldDocObj[key]});
		});

		for (var num in oldDocFields)
		{
			var tempkey = oldDocFields[num].Key;

			if (tempkey != '_id')
			{
				if (tempkey == 'ScanSessions')
				{
					var oldscansessionfield = oldDocFields[num].Value;
					for (var scan in oldscansessionfield)
					{
						delete oldscansessionfield[scan].MEGScans;
						delete oldscansessionfield[scan].MRIScans;
						delete oldscansessionfield[scan].TestResults;
					}
					
				}

				//check if this field exists for the new document and if the field is not an array
				if (newDoc[tempkey] != undefined 
					&& Object.prototype.toString.call( oldDocFields[num].Value ) != '[object Array]'
					&& Object.prototype.toString.call( oldDocFields[num].Value ) != '[object object]')
				{
					//check the value of this field in the new document, compare with old doc
					if (newDoc[tempkey] != oldDocFields[num].Value)
					{
						changedField.push({Key: tempkey, OldValue:oldDocFields[num].Value, NewValue:newDoc[tempkey]});
					}
				}


				//check if the field is an array
				if (newDoc[tempkey] != undefined 
					&& Object.prototype.toString.call( oldDocFields[num].Value ) == '[object Array]')
				{

					console.log(newDoc[tempkey]);

					if (tempkey == 'AccessAuthen')
					{
						var newscansessionfield = newDoc[tempkey];
						for (var newscan in newscansessionfield)
						{
							delete newscansessionfield[newscan]._id;
						}
					}

					if (tempkey == 'ScanSessions')
					{
						var newscansessionfield = newDoc[tempkey];
						for (var newscan in newDoc[tempkey])
						{
							console.log(newscan);
							console.log(newDoc[tempkey][newscan]);

							delete newDoc[tempkey][newscan]._id;
							delete newDoc[tempkey][newscan].MEGScans;
							delete newDoc[tempkey][newscan].MRIScans;
							delete newDoc[tempkey][newscan].TestResults;
						}
					}

					//check the value of this field in the new document, compare with old doc
					if (newDoc[tempkey] != oldDocFields[num].Value)
					{
						for (var i in oldDocFields[num].Value)
						{
							if (oldDocFields[num].Value[i]._id)
							{
								delete oldDocFields[num].Value[i]._id;
							}

							if (oldDocFields[num].Value[i].ScanSessions)
							{

								
							}
						}
						for (var j in newDoc[tempkey])
						{
							if (newDoc[tempkey][j]._id)
							{
								delete newDoc[tempkey][j]._id;
							}
						}


						var equal = (oldDocFields[num].Value == newDoc[tempkey])
						var stringeq = (JSON.stringify(oldDocFields[num].Value) == JSON.stringify(newDoc[tempkey]));
						console.log(equal, stringeq);

						if (!stringeq)
						{
							changedField.push({Key: tempkey, OldValue:oldDocFields[num].Value, NewValue:newDoc[tempkey]});
						}
						
					}
				}

				//check if the field is an object
				if (newDoc[tempkey] != undefined 
					&& Object.prototype.toString.call( oldDocFields[num].Value ) == '[object object]')
				{

					console.log("object object");
					//check the value of this field in the new document, compare with old doc
					if (newDoc[tempkey] !== oldDocFields[num].Value)
					{
						for (var i in oldDocFields[num].Value)
						{
							if (oldDocFields[num].Value[i]._id)
							{
								delete oldDocFields[num].Value[i]._id;
								delete oldDocFields[num].Value[i].MEGScans;
								delete oldDocFields[num].Value[i].MRIScans;
								delete oldDocFields[num].Value[i].TestResults;
							}
						}
						for (var j in newDoc[tempkey])
						{
							if (newDoc[tempkey][j]._id)
							{
								delete newDoc[tempkey][j]._id;
								delete newDoc[tempkey][j].MEGScans;
								delete newDoc[tempkey][j].MRIScans;
								delete newDoc[tempkey][j].TestResults;
							}
						}


						var equal = (oldDocFields[num].Value == newDoc[tempkey])
						var stringeq = (JSON.stringify(oldDocFields[num].Value) == JSON.stringify(newDoc[tempkey]));
						console.log(equal, stringeq);

						if (!stringeq && !equal)
						{
							changedField.push({Key: tempkey, OldValue:oldDocFields[num].Value, NewValue:newDoc[tempkey]});
						}
						
					}
				}

			}
			
		}


		var newChange = {
			"DocumentID": oldDocObj._id,
			"DocumentType": changeInfo.DocType,
			"ChangeType": changeInfo.ChangeType,
			"ChangeDocID": changeInfo.DocID,
			"User": uid,
			"Date": Date.now(),
			"ChangedField":changedField
		};

		//console.log(changedField);

		if (changedField.length != 0)
		{
			return newChange;
		}

		else 
		{
			return "nochange";
		}

}

function newSessionChangeUpdate (uid, oldDoc, newDoc, changeInfo){

	var changedField = [];

		//make mongo documents into objects
		var oldDocObj = oldDoc.toObject();

		var oldDocFields = [];

		Object.keys(oldDocObj).forEach(function(key) {
		    oldDocFields.push({Key: key, Value: oldDocObj[key]});
		});

		for (var num in oldDocFields)
		{
			var tempkey = oldDocFields[num].Key;

			//check if this field exists for the new document and if the field is not an array
			if (newDoc[tempkey] != undefined 
				&& Object.prototype.toString.call( oldDocFields[num].Value ) != '[object Array]'
				&& Object.prototype.toString.call( oldDocFields[num].Value ) != '[object object]')
			{
				//check the value of this field in the new document, compare with old doc
				if (newDoc[tempkey] != oldDocFields[num].Value)
				{
					changedField.push({Key: tempkey, OldValue:oldDocFields[num].Value, NewValue:newDoc[tempkey]});
				}
			}


			//check if the field is an array
			if (newDoc[tempkey] != undefined 
				&& Object.prototype.toString.call( oldDocFields[num].Value ) == '[object Array]')
			{
				//check the value of this field in the new document, compare with old doc
				if (newDoc[tempkey] !== oldDocFields[num].Value)
				{
					var newDocTestField = newDoc[tempkey];
					var oldDocTestField = oldDocFields[num].Value;

					for (var newElem in newDocTestField)
					{
						var oriArrayItem = newDocTestField[newElem];
						var arrayItem = newDocTestField[newElem];
						var itemID = arrayItem._id;

						//a new scan or test added
						if (itemID == undefined)
						{
							if (arrayItem.ScanName)
							{
								changedField.push({Key: tempkey, OldValue:'N/A', 
										NewValue:'Added: ' + arrayItem.ScanName});
							}
							else if (arrayItem.Type)
							{
								changedField.push({Key: tempkey, OldValue:'N/A', 
										NewValue:'Added: ' + arrayItem.Type});
							}
						}

						else
						{
							var founditem = false;
							//find this item in old array
							for (var oldElem in oldDocTestField)
							{

								console.log(oldDocTestField[oldElem], itemID);

								if (oldDocTestField[oldElem]._id == itemID)
								{
									founditem = true;
									var newItemFields = [];
									var oldItem = oldDocTestField[oldElem];
									//check each fields in an item
									Object.keys(arrayItem).forEach(function(key) {
									    newItemFields.push({itemKey: key, itemValue: arrayItem[key]});
									});

									for (var checkifield in newItemFields)
									{
										//checked item field
										var checkikey = newItemFields[checkifield].itemKey;

										console.log("item key: " + checkikey);
										console.log(oldItem[checkikey], newItemFields[checkifield].itemValue);
										//get item from old field

										if (checkikey != 'ScanName' && checkikey != 'Type')
										{
											if (oldItem[checkikey] == newItemFields[checkifield].itemValue)
											{
												delete oldItem[checkikey];
												delete arrayItem[checkikey];
											}
										}
									}

									console.log(arrayItem, oldItem);

									var itemeq = (JSON.stringify(oldItem) == JSON.stringify(arrayItem));
									console.log(itemeq);

									if (!itemeq)
									{
										if (arrayItem.ScanName)
										{
											var changekey = tempkey + ": " + arrayItem.ScanName;
											if (JSON.stringify(oldItem.ScanName) == JSON.stringify(arrayItem.ScanName))
											{
												delete oldItem.ScanName;
												delete arrayItem.ScanName;
											}
										}

										else if (arrayItem.Type)
										{
											var changekey = tempkey + ": " + arrayItem.Type;
											if (JSON.stringify(arrayItem.Type) == JSON.stringify(oldItem.Type))
											{
												delete oldItem.Type;
												delete arrayItem.Type;
											}
										}
										
										changedField.push({Key: changekey, OldValue:oldItem, 
											NewValue:arrayItem});
									}
								}
							}
						}
					}

					var newDocTestFieldIDs = newDocTestField.map(function(cv){return cv._id;});

					//go through all elements in the old document field array
					for (var i in oldDocTestField)
					{
						//if an id is not included in the new document field
						if (newDocTestFieldIDs.indexOf(oldDocTestField[i]._id) == -1)
						{
							if (oldDocTestField[i].ScanName)
							{
								changedField.push({Key: tempkey, OldValue:'Deleted: ' + oldDocTestField[i].ScanName, 
										NewValue:'N/A'});
							}
							else if (oldDocTestField[i].Type)
							{
								changedField.push({Key: tempkey, OldValue:'Deleted: ' + oldDocTestField[i].Type, 
										NewValue:'N/A'});
							}
						}
					}
				}
			}


			//check if the field is an object
			if (newDoc[tempkey] != undefined 
				&& Object.prototype.toString.call( oldDocFields[num].Value ) == '[object object]')
			{
				//check the value of this field in the new document, compare with old doc
				if (newDoc[tempkey] != oldDocFields[num].Value)
				{
					changedField.push({Key: tempkey, OldValue:oldDocFields[num].Value, NewValue:newDoc[tempkey]});
				}
			}

		}


		var newChange = {
			"DocumentID": oldDocObj._id,
			"DocumentType": changeInfo.DocType,
			"ChangeType": changeInfo.ChangeType,
			"ChangeDocID": changeInfo.DocID,
			"User": uid,
			"Date": Date.now(),
			"ChangedField":changedField
		};

		console.log(changedField);

		if (changedField.length != 0)
		{
			return newChange;
		}

		else 
		{
			return "nochange";
		}

}

function newChangeAdd (uid, newDoc, changeInfo){

	var changedField = [];


		var newChange = {
			"DocumentID": newDoc._id,
			"DocumentType": changeInfo.DocType,
			"ChangeType": changeInfo.ChangeType,
			"ChangeDocID": changeInfo.DocID,
			"User": uid,
			"Date": Date.now(),
			"ChangedField":changedField
		};

	return newChange;

}

function newChangeDelete (uid, oldDoc, changeInfo){

	var changedField = [];

		var newChange = {
			"DocumentID": oldDoc._id,
			"DocumentType": changeInfo.DocType,
			"ChangeType": changeInfo.ChangeType,
			"ChangeDocID": changeInfo.DocID,
			"User": uid,
			"Date": Date.now(),
			"ChangedField":changedField
		};

	return newChange;

}

function newScanChangeDelete (uid, oldDoc, changeInfo){

	var changedField = [{Key: 'ScanSessions', OldValue: 'N/A' , NewValue: "Session: '" +changeInfo.DeletedSessionID + "' deleted"}];

		var newChange = {
			"DocumentID": oldDoc._id,
			"DocumentType": changeInfo.DocType,
			"ChangeType": changeInfo.ChangeType,
			"ChangeDocID": changeInfo.DocID,
			"User": uid,
			"Date": Date.now(),
			"ChangedField":changedField
		};

	return newChange;

}

