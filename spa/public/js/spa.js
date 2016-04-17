/*
* spa.js
* Root namespace module
*/

/* jslink			browser: true,		continue:true,
	devel: true,	indent:2,			maxerr : 50,
	newcap: true,	nomen: true,		plusplus: true,
	regexp: true,	sloppy: true,		vars : false,
	white : true
*/
var spa = (function(){
	var initModule = function($container){
		spa.data.initModule();
		spa.model.initModule();
		spa.shell.initModule($container);
	}
	return {initModule:initModule};
}());