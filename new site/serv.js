const express=require("express");
const app=express();
const mongo=require("mongodb");
const bodyParser = require("body-parser");
const cors = require('cors');
const mongoClient = mongo.MongoClient;
let db;
let POICollection;
var tools = require('C:/Users/alekk/OneDrive/Desktop/js/functions.js');

mongoClient.connect('mongodb+srv://panos:5555p@cluster30.et1yr.mongodb.net/test')
  .then(client => {
    
    db = client.db('example')
    POICollection = db.collection('POIs')
    

    app.use("/login",cors());
    app.use("/login",bodyParser.urlencoded({ extended: false }),bodyParser.json());
    app.post("/login",async function(req,res){
        //res.json(await searchPOIs(req.body.searchBar,[38.2379767, 21.7259916]));
        console.log(req.body.user);
        console.log(req.body.pass);
        tools.Check_creds(db,req.body.user,req.body.pass).then(res.send.bind(res));
       
        //res.end();
    })

    app.use("/sign",cors());
    app.use("/sign",bodyParser.urlencoded({ extended: false }),bodyParser.json());
    app.post("/sign",async function(req,res){
      
      tools.User_insertion(db,req.body.user,req.body.email,req.body.pass).then(res.send.bind(res)).catch(xx=>{res.send("error_dup")})
      
    })

    app.use("/poi",cors());
    app.use("/poi",bodyParser.urlencoded({ extended: false }),bodyParser.json());
    app.post("/poi",async function(req,res){
      
      POICollection.find().limit(5).toArray().then(res.send.bind(res))
      
    })

    app.listen(4545);
  })