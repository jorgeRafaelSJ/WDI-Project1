// SERVER-SIDE JAVASCRIPT

// REQUIREMENTS //
var express = require("express");
var session = require('express-session');
var app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var bcrypt = require('bcrypt');
var db = require("./models/index");
var User = require('./models/user');
var Post = require('./models/post');
// google maps api
require('dotenv').load();
var GOOGLE_MAPS_KEY = process.env.GOOGLE_MAPS_KEY;

// MIDDLEWARE //

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(session({
  saveUninitialized: true,
  resave: true,
  secret: 'SuperSecretCookie',
  cookie: { maxAge: 24 * 60 * 60 * 1000 }
}));

/* 	ROUTES 	*/



//	GET ROUTES

// GET route for the root url
app.get('/', function(req,res){
	res.render('explore', {GOOGLE_MAPS_KEY: GOOGLE_MAPS_KEY});
});

// GET users api
app.get('/api/users', function (req,res) {

});

//GET for explore search
app.get('/api/explore/:search', function (req,res) {
	console.log(req.params.search);
	db.Post
	    .find(
	        { $text : { $search : req.params.search } }, 
	        { score : { $meta: "textScore" } }
	    )
	    .sort({ score : { $meta : "textScore" } })
	    .exec(function(err, results) {
	        res.json(results);
	    });
});

// GET posts api
app.get('/api/posts', function (req,res) {
	db.Post.find({name: req.params.location}, function(err, posts) {
		if(err) console.log(err);
		res.render('profile', {posts: posts, GOOGLE_MAPS_KEY: GOOGLE_MAPS_KEY, user: req.session.user});
	});
});

// GET route for the map url
app.get('/map', function(req,res){
	db.Post.find({}, function(err, posts) {
		if(err) console.log(err);
		res.render('map', {posts:posts, GOOGLE_MAPS_KEY: GOOGLE_MAPS_KEY});
	});
});

// GET route for setting marks on map
app.get('/api/marks', function (req,res) {
db.User.findOne({_id: req.session.userId})
	.populate('posts')
		.exec(function(err, user) {
			if(err) console.log("error was: ", err);
			res.json({user: user, GOOGLE_MAPS_KEY: GOOGLE_MAPS_KEY});
	});
});

// GET route for the profile url
app.get('/profile', function (req,res){
	db.User.findOne({_id: req.session.userId})
		.populate('posts')
		.exec(function(err, user) {
			if(err) console.log("error was: ", err);
			res.render('profile', {user: user, GOOGLE_MAPS_KEY: GOOGLE_MAPS_KEY});
		});
});

// GET check auth current user auth

app.get('/current-user', function (req, res) {
	res.json({user: req.session.user});
});

// GET logout user

app.get('/logout', function (req, res) {
	req.session.user = null;
	res.render('explore', {GOOGLE_MAPS_KEY: GOOGLE_MAPS_KEY});
});



// POST ROUTES

// create a post
app.post('/api/posts', function (req, res) {
	db.Post.create(req.body, function (err, post) {
		if(err) {
			console.log(err);
		}
		if(req.session.user) {
			// push the post ID into the user posts array
			db.User.findOne({_id:req.session.user._id}, function (err, user) {
				user.posts.push(post);
				user.save();
			});
		}
		res.json(post);
	});
});

// create a user 
app.post('/api/users', function(req, res) {
  User.createSecure(req.body.username, req.body.email, req.body.password, req.body.bio, req.body.location, req.body.img, function (err, user) {
  	req.session.userId = user._id;
    req.session.user = user;
    res.json(user);
  });
});

// authenticate the user 
app.post('/login', function (req, res) {
  // call authenticate function to check if password user entered is correct
  User.authenticate(req.body.email, req.body.password, function (err, user) {
  		req.session.userId = user._id;
  		req.session.user = user;
    	res.json(user);
  	});
});


// DELETE ROUTES

// delete post route
app.delete('/posts/:id', function(req, res) {
	db.Post.findOne({
		_id: req.params.id
	}).remove(function(err, post) {
		if (err) console.log(err);
		res.json("The post is gone");
	});
});

app.listen(process.env.PORT || 3000, function() {
  console.log("server running on port 3000");
});