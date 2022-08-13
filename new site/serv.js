const express=require("express");
const app=express();
const mongo=require("mongodb");
const bodyParser = require("body-parser");
const cors = require('cors');
const mongoClient = mongo.MongoClient;
let db;
let POICollection;

mongoClient.connect('mongodb+srv://panos:5555p@cluster30.et1yr.mongodb.net/test')
  .then(client => {
    
    db = client.db('example')
    POICollection = db.collection('exmpl1')
    

    app.use("/s",cors());
    app.use("/s",bodyParser.urlencoded({ extended: false }),bodyParser.json());
    app.post("/s",async function(req,res){
        //res.json(await searchPOIs(req.body.searchBar,[38.2379767, 21.7259916]));
        console.log(req);
        res.end();
    })

    app.listen(4545);
  })