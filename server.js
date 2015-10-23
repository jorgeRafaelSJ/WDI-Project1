// SERVER-SIDE JAVASCRIPT

// REQUIREMENTS //
var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var db = require("./models/index");

// MIDDLEWARE //

app.set("view engine", "ejs");

app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));

//
require('dotenv').load();
var GOOGLE_MAPS_KEY = process.env.GOOGLE_MAPS_KEY;

// ROUTES //

// GET route for the root url
app.get('/', function(req,res){
	res.render('index', {GOOGLE_MAPS_KEY: GOOGLE_MAPS_KEY});
});

// GET route for the map url
app.get('/map', function(req,res){
	res.render('map', {GOOGLE_MAPS_KEY: GOOGLE_MAPS_KEY});
});

// GET route for the profile url
app.get('/profile', function(req,res){
	res.render('profile', {GOOGLE_MAPS_KEY: GOOGLE_MAPS_KEY});
});

app.listen(3000, function() {
  console.log("server running on port 3000");
});