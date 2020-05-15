//jshint esversion:6
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
const passport=require("passport");
const local=require("passport-local");
const passportLocalMongoose=require("passport-local-mongoose");
const session = require('express-session');
const app = express();
/*const bcrypt = require('bcryptjs');
const salt = bcrypt.genSaltSync(10);*/
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
//position must be rembered
//to use the session package
app.use(session({
   secret: 'keyboard cat',
    resave: false,
    saveUninitialized:false }));
//to use passport to intialize passport package
app.use(passport.initialize());
app.use(passport.session());
mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser: true,useUnifiedTopology: true,useCreateIndex:true});
const userSchema =new mongoose.Schema( {
  email: String,
  password: String
});
userSchema.plugin(passportLocalMongoose);
const User=mongoose.model("User",userSchema);
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
//mongoose.set('useFindAndModify', false);

app.get("/",function(req,res){
  res.render("home");
})
app.get("/register",function(req,res){
  res.render("register");
})
app.get("/login",function(req,res){
  res.render("login");
})
app.get("/secrets",function(req,res){
  if(req.isAuthenticated()){
    res.render("secrets");
  }else{
    res.redirect("login");
  }
})
app.get("/logout",function(req,res){
  req.logout();
  res.redirect("/");
})
app.post("/register",function(req,res){
  /*bcrypt.hash(req.body.password, salt, function(err, hash) {
    const user=new User({
      email: req.body.username,
      password:hash
    })
    user.save(function(err,result){
      if(err){
        res.send(err);
      }
      else{
        res.render("secrets");
      }
    })
  });*/

User.register({username:req.body.username},req.body.password,function(err,user){
  if(err){
    console.log(err);
    res.redirect("/register");
  }else{
    passport.authenticate("local")(req,res,function(){
      res.redirect("/secrets");
    })
  }

})
  });

app.post("/login",function(req,res){
/*User.findOne({email:req.body.username},function(err,founditem){
  if(err){
    console.log(err);
  }else{
    bcrypt.compare(req.body.password,founditem.password , function(err, result) {
    if(result===true)
    {
      res.render("secrets");
    }
    });
  }
})*/
const user=new User({
  username:req.body.username,
  password:req.body.password
});
req.login(user,function(err){
  if(err){
    console.log(err);
    res.redirect("/register");
  }else{
    passport.authenticate("local")(req,res,function(){
      res.redirect("/secrets");
    })
  }
})
})
app.listen(3000, function() {
  console.log("Server started on port 3000");
});
//clientid=101244940420-qes9k5uor4aarcrv65hmp2ruue4cr5gn.apps.googleusercontent.com
//secret=IAv42cWmpfci6ulQOFRln3g-
