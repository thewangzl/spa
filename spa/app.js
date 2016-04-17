/*
* app.js  Express server with advanced routing
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
	app = express(),
	server = http.createServer(app);
//--------------------End module scope variables ----------------

//--------------------Begin server configuration ----------------
app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));
app.use(router());

app.use(logger('dev'));
app.use(errorHandler());


app.get('/',function(request, response){
	response.redirect('/spa.html');
});

app.get('/user/list', function(request, response){
	response.contentType('json');
	response.send({title : 'user list'});
});

app.post('/user/create', function(request, response){
	response.contentType('json');
	response.send({title : 'user created'});
});

app.get('/user/read/:id([0-9]+)', function(request, response){
	response.contentType('json');
	response.send({
		title : 'user with id ' + request.params.id + ' found'
	});
});

app.post('/user/update/:id([0-9]+)', function(request, response){
	response.contentType('json');
	response.send({
		title : 'user with id ' + request.params.id + ' updated'
	});
});

app.post('/user/delete/:id([0-9]+)', function(request, response){
	response.contentType('json');
	response.send({
		title : 'user with id ' + request.params.id + ' deleted'
	});
});


//--------------------End server configuration ----------------

//--------------------Begin start server ----------------
server.listen(3000);
console.log(
	'Express server listening on port %d in %s mode',
	server.address().port, app.settings.env
);
//--------------------Begin start server ----------------
