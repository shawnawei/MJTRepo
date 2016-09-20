
var https = require('https');
//load express, path module
var express = require ('express');
var path = require('path');
var routes = require('./routes');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var httpStrategy = require('passport-http').BasicStrategy;
var LDAPStrategy = require('passport-ldapauth').Strategy;
var cookieParser = require('cookie-parser');
var ExpressSession = require('express-session');
var app = express();
var port = 3000;


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(ExpressSession({
	secret: 'this is the secret',
	resave: false,
	saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy (verifyUser));

//passport.use(new httpStrategy (verifyUser));

function verifyUser (username, password, done){
	if (username == 'admin' && password == '123')
	{
		var user = {username: username, password: password};
		return done(null, user);
	}
	else
	{
		return done(null, false, {message: 'Unable to login'});
	}
};

passport.use(new LDAPStrategy({
	server: {
        url: 'ldap://neuroimageweb.sickkids.ca:389',
        searchBase: 'cn=accounts,dc=neuroimage,dc=sickkids,dc=ca',
        searchFilter: '(uid={{username}})'
      }
}));


//make the session stored in another way
passport.serializeUser(function(user, done){

	//error, something
	done(null, user);
});

passport.deserializeUser(function(user, done){
	done(null, user);
});


//connect to mongoose

mongoose.connect('mongodb://localhost/test', function(err){
    if(!err){
        console.log('connected to mongoDB');
    } else{
        throw err;
    }
});

//dirname is the folder that contains this script(server.js)
app.set('views', path.join(__dirname, './client/views'));


//use middleware
//===============================
app.use(express.static(path.join(__dirname,'/client')));


//define routes
//==================================

app.use (require('./routes'));
app.use(function(req, res) {
    res.sendFile(__dirname + '/client/index.html');
});

app.listen(port, function() {
	console.log('ready on port ' + port);
});

















/*
var http = require('http');
var port = 3000;
http.createServer( function(request, response){
	response.end('MJTLab Data Repository');
}).listen(port);

console.log('Connected');
*/