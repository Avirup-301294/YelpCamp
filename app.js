var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var mongoose = require('mongoose');
var flash = require('connect-flash');
var passport    = require("passport");
var cookieParser = require("cookie-parser");
var LocalStrategy = require("passport-local");
var methodOverride = require("method-override");
var session = require("express-session");
var Campground = require("./models/campground");
var Comment = require("./models/comment");
var User = require("./models/user");
var seedDB = require("./seeds");


//requring routes
var commentRoutes    = require("./routes/comments"),
    campgroundRoutes = require("./routes/campgrounds"),
    indexRoutes      = require("./routes/index")

 //mongoose.connect('mongodb://localhost:27017/yelp_camp', 
				 //{useNewUrlParser: true, useUnifiedTopology: true,useFindAndModify:false});
mongoose.connect("mongodb+srv://avirup:Avirup@cluster0-l1w38.mongodb.net/test?retryWrites=true&w=majority",{
	useNewUrlParser: true,
	useCreateIndex: true,
	useFindAndModify: false,
	useUnifiedTopology: true
}).then(() => {
	console.log("connect to db");
}).catch(err => {
	console.log("Error:",err.message);
});
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");   
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());
// seedDB(); //seed the database

// PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret: "Once again Rusty wins cutest dog!",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
   res.locals.currentUser = req.user;
   res.locals.error = req.flash("error");
   res.locals.success = req.flash("success");
   next();
});

app.use("/", indexRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);

app.listen(process.end.PORT,process.env.IP, function(){
   console.log("The YelpCamp Server Has Started!");
});