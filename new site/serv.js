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
    
    //Εντολές που χρησιμοποιούνται για τον έλεγχο των στοιχείων που εισάγει ο χρήστης στην σελίδα του login.
    app.use("/login",cors());
    app.use("/login",bodyParser.urlencoded({ extended: false }),bodyParser.json());
    app.post("/login",async function(req,res){
        //res.json(await searchPOIs(req.body.searchBar,[38.2379767, 21.7259916]));
        console.log(req.body.user);
        console.log(req.body.pass);
        tools.Check_creds(db,req.body.user,req.body.pass).then(res.send.bind(res));
    })
    //Εντολές που χρησιμοποιούνται για την εισαγωγή των στοιχείων ενός χρήστη μέσω της σελίδας SignUp.
    app.use("/sign",cors());
    app.use("/sign",bodyParser.urlencoded({ extended: false }),bodyParser.json());
    app.post("/sign",async function(req,res){
      
      tools.User_insertion(db,req.body.user,req.body.email,req.body.pass).then(res.send.bind(res)).catch(xx=>{res.send("error_dup")})
      
    })
    //Εντολές που χρησιμοποιούνται για την εμφάνιση συγκεκριμένου αριθμού από markers(PΟΙs) στην κεντρική σελίδα(main page).
    app.use("/poi",cors());
    app.use("/poi",bodyParser.urlencoded({ extended: false }),bodyParser.json());
    app.post("/poi",async function(req,res){
      
      POICollection.find().limit(20).toArray().then(res.send.bind(res))
      
    })
    //Εντολές που χρησιμοποιούνται για την εμφάνιση συγκεκριμένων POIs στην main page ,σύμφωνα με τον τύπο POI θα εισάγει ο χρήστης.
    app.use("/searchpoi",cors());
    app.use("/searchpoi",bodyParser.urlencoded({ extended: false }),bodyParser.json());
    app.post("/searchpoi",async function(req,res){
      
      tools.searchPOIs(db,req.body.poitype,[38.2376827,21.7259359]).then(res.send.bind(res))

    })
    //Εντολές που χρησιμοποιούνται για την εμφάνιση του ποσοστού επισκεψιμότητας σε ένα POI 
    //για συγκεκριμένη χρονική στιγμή που καθορίζεται από την  παρακάτω συνάρτηση.Τα δεδομένα εμφανίζονται στην main page.
    app.use("/nvisit",cors());
    app.use("/nvisit",bodyParser.urlencoded({ extended: false }),bodyParser.json());
    app.post("/nvisit",async function(req,res){
      
      
      tools.population_estimation(db,mongo.ObjectId(req.body.pid),new Date()).then(res.send.bind(res))

    })
    //Εντολές που χρησιμοποιούνται για την εισαγωγή εκτίμησης επισκεψιμότητας POI.Τα δεδομένα εμφανίζονται στην main page.
    app.use("/visitor",cors());
    app.use("/visitor",bodyParser.urlencoded({ extended: false }),bodyParser.json());
    app.post("/visitor",async function(req,res){
      console.log(req.body)
      tools.Add_visit(db,mongo.ObjectId(req.body.userid),mongo.ObjectId(req.body.poivisti))
      if(req.body.popnum!=''){
        tools.Overwrite_population(db,mongo.ObjectId(req.body.poivisti),Number(req.body.popnum))
      }
      res.end();

    })
    //Εντολές που χρησιμοποιούνται για την Δήλωση Κρούσματος στην σελίδα report.
    app.use("/report",cors());
    app.use("/report",bodyParser.urlencoded({ extended: false }),bodyParser.json());
    app.post("/report",async function(req,res){
      console.log(req.body)
      if(await tools.check_within_14_days(db,mongo.ObjectId(req.body.userid))) res.send("already sick");
      else{
      tools.Catch_covid(db,mongo.ObjectId(req.body.userid),new Date(req.body.diagnosed));
      res.send("nice covid");}

    })

    app.listen(4545);
  })