/*
* app.js  Express server with routes module
*/
/* jslink			browser: true,		continue:true,
	devel: true,	indent:2,			maxerr : 50,
	newcap: true,	nomen: true,		plusplus: true,
	regexp: true,	sloppy: true,		vars : false,
	white : true
*/
/* global */
//--------------------Begin module scope variables ----------------
'use strict';
var 
	http = require('http'),
	express = require('express'),
	logger = require('morgan'),
	bodyParser = require('body-parser'),
	router = require('router'),
	errorHandler = require('errorhandler'),

	routes = require('./routes'),
	app = express(),
	server = http.createServer(app);

//--------------------End module scope variables ----------------

//--------------------Begin server configuration ----------------
app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));
app.use(router());

app.use(logger('dev'));
app.use(errorHandler());

routes.configRoutes(app, server);

//--------------------End server configuration ----------------

//--------------------Begin start server ----------------
server.listen(3000);
console.log(
	'Express server listening on port %d in %s mode',
	server.address().port, app.settings.env
);
//--------------------Begin start server ----------------
