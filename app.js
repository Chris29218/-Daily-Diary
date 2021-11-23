//jshint esversion:6

const express = require('express');
const ejs = require("ejs");
const port = process.env.PORT || 3000 ;
const mongoose = require('mongoose');
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(express.urlencoded());
app.use(express.static('assets'));

// DB
// local database
mongoose.connect('mongodb://localhost:27017/blogsDB');

// hosted database
// mongoose.connect('mongodb+srv://admin-sky:test123@cluster0.mtqsh.mongodb.net/blogsDB');

// creating Schema
const postSchema = new mongoose.Schema({
    title:{
        type: String,
        required: true
    },
    description:{
        type: String,
        required: true
    }
});

//creating model
const Post = mongoose.model('Post', postSchema);

//default items
const homeStartingPost = new Post({
    title: "Welcome to the Daily Journal!",
    description: "A journal is a record that stores every details of your life ranging from events, ideas, feelings, and your daily thoughts and memories. In this way, you will be able to remember what you did, what you were thinking and feeling, and what had happened when you were younger."
});

let defaultPost = [homeStartingPost];



const aboutContent = "Hey! This is Sky, a passionate Web Developer. I beleave in learning & creating Great Projects. Beleave it."
const contactContent = "You can contact me @ab29218@gmail.com & also follow me on IG @skyintech."


app.get('/', function(req, res){
    // retrieving data from DB
    Post.find({}, function(err, foundPosts) {
        
        // to push default Items list for the first time only
        if(foundPosts.length === 0){
            Post.insertMany(defaultPost, function(err) {
                if(err){ 
                    console.log(err);
                }
                else{
                    console.log("Successfully pushed default post to DB");
                }
            }); 
            res.redirect('/');                    
        }
        else{
            res.render('home', {homeContent:foundPosts});
        }
    });
    
});

app.get('/about', function(req, res){
    res.render('about', {aboutPageContent:aboutContent});
});

app.get('/contact', function(req, res){
    res.render('contact', {contactPageContent: contactContent});
});

app.get('/posts', function(req, res){
    res.redirect('/');
});

app.get('/compose', function(req, res){
    res.render('compose.ejs');
});

app.post('/compose', function(req, res){
    let titleData = req.body.inputTitle;
    let descriptionData = req.body.inputData;

    const postData = new Post ({
        title : titleData, 
        description : descriptionData
    });

    postData.save(function(err){
        if (!err){
          res.redirect("/");
        }
    });

});

app.get('/posts/:topic', function(req, res){

    const requestedId = req.params.topic;

    Post.find({}, function(err, foundPosts) {
        if(!err) {
            foundPosts.forEach(function(post) {
                const storedId = post._id;
            
                if(storedId == requestedId){
                    res.render('post', {postTitle:post.title, postContent:post.description});  // , postId:post._id});  we can send extra parameters too
                }
            });
        }
    });

});

app.post('/delete', function(req, res){
    
    let requestedTitle = req.body.delBtn;
    
    Post.deleteOne({title:requestedTitle}, function(err){
        if(err) {
            console.log(err);
        }
        else {
            res.redirect("/");
        }
    });

});


app.listen(port, function(){
    console.log("Server is Up and Running on "+port);
});