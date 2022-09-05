const express=require("express");
const app=express();
const mongo=require("mongodb");
const bodyParser = require("body-parser");
const cors = require('cors');
const fileUpload = require('express-fileupload');
const mongoClient = mongo.MongoClient;
let db;
let POICollection;
var tools = require('C:/Users/alekk/OneDrive/Desktop/js/functions.js');

mongoClient.connect('mongodb+srv://panos:5555p@cluster30.et1yr.mongodb.net/test')
  .then(client => {
    
    db = client.db('example')
    POICollection = db.collection('POIs')


    app.use(fileUpload({
      createParentPath: true
  }));
    
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

    app.use("/threats",cors());
    app.use("/threats",bodyParser.urlencoded({ extended: false }),bodyParser.json());
    app.post("/threats",async function(req,res){
      console.log(req.body)
      threts = await tools.are_you_a_threat(db,mongo.ObjectId(req.body.userid));
      res.send(await Promise.all( threts.map(e=>tools.VisitToLine(db,e))));}

    )

    app.use("/mystory",cors());
    app.use("/mystory",bodyParser.urlencoded({ extended: false }),bodyParser.json());
    app.post("/mystory",async function(req,res){
      console.log(req.body)
      mouser=mongo.ObjectId(req.body.userid);
      av= await tools.all_my_visits(db,mouser);
      avisits = await Promise.all(av.map(e=>tools.VisitToLine(db,e)));
      asicks = await tools.all_my_sickness(db,mouser);
      res.send({allvisits:avisits,allsick:asicks});}

    )


    app.use("/settings",cors());
    app.use("/settings",bodyParser.urlencoded({ extended: false }),bodyParser.json());
    app.post("/settings",async function(req,res){
      console.log(req.body)
      mouser=mongo.ObjectId(req.body.userid);
      upd=await tools.edit_user(db,mouser,req.body.user,req.body.pass);
      if(upd.modifiedCount>0)res.send("Success");else res.send("");
    }

    )

    app.use("/admin",cors());
    app.use("/admin",bodyParser.urlencoded({ extended: false }),bodyParser.json());
    app.post("/admin",async function(req,res){
      console.log(req.body)
      res.send(await tools.Check_Admin(db,req.body.user,req.body.pass));
    }

    )

    app.use("/basicstat",cors());
    app.use("/basicstat",bodyParser.urlencoded({ extended: false }),bodyParser.json());
    app.post("/basicstat",async function(req,res){
      console.log(req.body)
      res.send(await tools.EveryStatistic(db));
    }

    )

    app.use("/macrostats",cors());
    app.use("/macrostats",bodyParser.urlencoded({ extended: false }),bodyParser.json());
    app.post("/macrostats",async function(req,res){
      console.log(req.body)
      res.send(await tools.graphdata(db,req.body.dra));
    }

    )

    app.use("/microstats",cors());
    app.use("/microstats",bodyParser.urlencoded({ extended: false }),bodyParser.json());
    app.post("/microstats",async function(req,res){
      console.log(req.body)
      
      res.send(await tools.hourtostat(db,new Date(req.body.calendar)));
    }

    )


    app.use("/jsonPOIS",cors());
    //app.use("/jsonPOIS",bodyParser.urlencoded({ extended: false }),bodyParser.json());
  
  app.post("/jsonPOIS",async function(req,res){
    //console.log(req)
    if(!req.files) {res.send("nofiles")}
    else {
      let myfile=req.files.jzon;
      console.log(myfile)
      myfile.mv("C:/Users/alekk/OneDrive/Desktop/project_Web/new_site/uploadedfiles/"+myfile.name,e=>
      tools.json_file_function(db,"C:/Users/alekk/OneDrive/Desktop/project_Web/new_site/uploadedfiles/"+myfile.name)
      );
      res.send("olaok")
    }
    
  })


  app.use("/hiroshima",cors());
    app.use("/hiroshima",bodyParser.urlencoded({ extended: false }),bodyParser.json());
    app.post("/hiroshima",async function(req,res){
      tools.delete_POIs(db);
      res.send("its done.");
    }

    )

    app.listen(4545);
  })