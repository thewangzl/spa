/*
* crud.js module to provide CRUD db capabilities
*/
/* jslink			browser: true,		continue:true,
	devel: true,	indent:2,			maxerr : 50,
	newcap: true,	nomen: true,		plusplus: true,
	regexp: true,	sloppy: true,		vars : false,
	white : true
*/
/* global */

//-------------------------- Begin module scope variables -------------------
'use strict';
var 
	loadSchema, checkSchema, clearIsOnline,
	checkType, constructObj, readObj,
	updateObj, destroyObj,

	mongodb = require('mongodb'),
	fsHandle = require('fs'),
	JSV = require('JSV').JSV,
	//cache = require('./cache'),

	mongoServer = new mongodb.Server(
		'localhost', 27017
	),
	dbHandle = new mongodb.Db(
		'spa', mongoServer, {safe : true}
	),
	validator = JSV.createEnvironment(),
	objTypeMap = {'user' : {}};
//-------------------------- End module scope variables -------------------

//-------------------------- Begin utility methods -------------------
loadSchema = function(schema_name, schema_path){
	fsHandle.readFile(schema_path, 'utf8', function(err, data){
		objTypeMap[schema_name] = JSON.parse(data);
	})
};
checkSchema = function(obj_type, obj_map, callback){
	var schema_map = objTypeMap[obj_type],
		report_map = validator.validate(obj_map, schema_map);
		callback(report_map.errors);
};
clearIsOnline = function(){
	updateObj(
		'user',
		{is_online : true},
		{is_online : false},
		function(response_map){
			console.log('All users set to offline', response_map);
		}
	);
}
//-------------------------- End utility methods -------------------

//-------------------------- Begin public methods -------------------
checkType = function(obj_type){
	if(!objTypeMap[obj_type]){
		return ({
			error_msg : 'Object type "' + obj_type + '" is not supported.'
		})
	}
	return null;
};
constructObj = function(obj_type, obj_map, callback){
	var type_check_map = checkType(obj_type);
	if(type_check_map){
		callback(type_check_map);
		return;
	}
	checkSchema(
		obj_type, obj_map,
		function(error_list){
			if(error_list.length === 0){
				dbHandle.collection(
					obj_type,
					function(outer_error,collection){
						var options_map = {safe : true};
						collection.insert(
							obj_map,
							options_map,
							function(inner_error, result_map){
								callback(result_map);
							}
						);
					}
				);
			}else{
				callback({
					error_msg : 'Input document not valid',
					error_list : error_list
				});
			}
		}
	);
};
readObj = function(obj_type, find_map, fields_map, callback){
	var type_check_map = checkType(obj_type);
	if(type_check_map){
		callback(type_check_map);
		return;
	}
	//如果缓存未命中，则执行回调函数
	//cache.getValue(find_map, callback,function(){
		dbHandle.collection(
			obj_type,
			function(outer_error, collection){
				collection.find(find_map, fields_map).toArray(
					function(inner_error, map_list){
						//
	//					cache.setValue(find_map, map_list);
						callback(map_list);
					}
				);
			}
		);
	//});
	
};
updateObj = function(obj_type, find_map, set_map, callback){
	var type_check_map = checkType(obj_type);
	if(type_check_map){
		callback(type_check_map);
		return;
	}
	checkSchema(
		obj_type, set_map,
		function(error_list){
			if(error_list.length === 0){
				dbHandle.collection(
					obj_type,
					function(outer_error,collection){
						collection.update(
							find_map,
							{$set : set_map},
							{safe : true, multi : true, upsert : true},
							function(inner_error, update_count){
								callback({update_count : update_count});
							}
						);
					}
				);
			}else{
				callback({
					error_msg : 'Input document not valid',
					error_list : error_list
				});
			}
		}
	);
};
destroyObj = function(obj_type, find_map, callback){
	var type_check_map = checkType(obj_type);
	if(type_check_map){
		callback(type_check_map);
		return;
	}
//	cache.deleteKey(find_map);
	dbHandle.collection(
		obj_type,
		function(outer_error, collection){
			var options_map = {safe : true, single : true};
			collection.remove(find_map, options_map,
				function(inner_error, delete_count){
					callback({delete_count : delete_count});
				}
			);
		}

	)
};

module.exports = {
	makeMongoId	: mongodb.ObjectID,
	checkType	: checkType,
	construct	: constructObj,
	read		: readObj,
	update		: updateObj,
	destroy		: destroyObj
}
//-------------------------- Begin public methods -------------------
//-------------------------- Begin module initialization -------------------
dbHandle.open(function(){
	console.log('** Connected to MongoDB ** ');
});
//load schema into memoty(objTypeMap)
(function(){
	var schema_name, schema_path;
	for(schema_name in objTypeMap){
		if(objTypeMap.hasOwnProperty(schema_name)){
			schema_path = __dirname + '/' +schema_name + '.json';
			loadSchema(schema_name, schema_path);
		}
	}
}());
//-------------------------- Begin module initialization -------------------