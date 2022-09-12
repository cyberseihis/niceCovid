const express = require("express");
const app = express();
const mongo = require("mongodb");
const bodyParser = require("body-parser");
const cors = require('cors');
const fileUpload = require('express-fileupload');
const mongoClient = mongo.MongoClient;
let db;
let POICollection;
var tools = require('../Database js/functions.js');

async function abuse (path,funq){
  app.post(path,async (req,res)=>res.send(await funq(req.body)));
}

mongoClient.connect('mongodb+srv://panos:5555p@cluster30.et1yr.mongodb.net/test')
  .then(client => {

    db = client.db('example')
    POICollection = db.collection('POIs')


    app.use(fileUpload({
      createParentPath: true
    }));

    app.use(cors());
    app.use(bodyParser.urlencoded({ extended: false }), bodyParser.json());

   

    //Εντολές που χρησιμοποιούνται για τον έλεγχο των στοιχείων που εισάγει ο χρήστης στην σελίδα του login.

    abuse("/login", async function (req) {
      //res.json(await searchPOIs(req.searchBar,[38.2379767, 21.7259916]));
      console.log(req.user);
      console.log(req.pass);
      return await tools.Check_creds(db, req.user, req.pass);
    })
    //Εντολές που χρησιμοποιούνται για την εισαγωγή των στοιχείων ενός χρήστη μέσω της σελίδας SignUp.

    abuse("/sign", async function (req) {

      return await tools.User_insertion(db, req.user, req.email, req.pass)

    })
    
    //Εντολές που χρησιμοποιούνται για την εμφάνιση συγκεκριμένων POIs στην main page ,σύμφωνα με τον τύπο POI θα εισάγει ο χρήστης.

    abuse("/searchpoi", async function (req) {

      return await tools.searchPOIs(db, req.poitype, [38.2376827, 21.7259359])

    })
    //Εντολές που χρησιμοποιούνται για την εμφάνιση του ποσοστού επισκεψιμότητας σε ένα POI 
    //για συγκεκριμένη χρονική στιγμή που καθορίζεται από την  παρακάτω συνάρτηση.Τα δεδομένα εμφανίζονται στην main page.

    abuse("/nvisit", async function (req) {


      return await tools.population_estimation(db, mongo.ObjectId(req.pid), new Date())

    })
    //Εντολές που χρησιμοποιούνται για την εισαγωγή εκτίμησης επισκεψιμότητας POI.Τα δεδομένα εμφανίζονται στην main page.

    abuse("/visitor", async function (req) {
      console.log(req)
      tools.Add_visit(db, mongo.ObjectId(req.userid), mongo.ObjectId(req.poivisti))
      if (req.popnum != '') {
        tools.Overwrite_population(db, mongo.ObjectId(req.poivisti), Number(req.popnum))
      }
      

    })
    //Εντολές που χρησιμοποιούνται για την Δήλωση Κρούσματος στην σελίδα report.

    abuse("/report", async function (req) {
      console.log(req)
      if (await tools.check_within_14_days(db, mongo.ObjectId(req.userid))) return("You are already diagnosed sick!");
      else {
        tools.Catch_covid(db, mongo.ObjectId(req.userid), new Date(req.diagnosed));
        return("nice covid");
      }

    })
    //Εντολές που χρησιμοποιούνται για την λίστα των πιθανών επαφών στην σελίδα contacts.

    abuse("/threats", async function (req) {
      console.log(req)
      threts = await tools.are_you_a_threat(db, mongo.ObjectId(req.userid));
      return(await Promise.all(threts.map(e => tools.VisitToLine(db, e))));
    }

    )
    //Εντολές που χρησιμοποιούνται για τις λίστες των συνολικών επισκέψεων και των report του χρήστη στην σελίδα user_settings 

    abuse("/mystory", async function (req) {
      console.log(req)
      mouser = mongo.ObjectId(req.userid);
      av = await tools.all_my_visits(db, mouser);
      avisits = await Promise.all(av.map(e => tools.VisitToLine(db, e)));
      asicks = await tools.all_my_sickness(db, mouser);
      drakes = asicks.map(as => { return { s: as.Date.toLocaleString() } });
      return({ allvisits: avisits, allsick: drakes });
    }

    )

    //Εντολές που καθιστούν δυνατή την αλλαγή των στοιχείων του χρήστη 

    abuse("/settings", async function (req) {
      console.log(req)
      mouser = mongo.ObjectId(req.userid);
      upd = await tools.edit_user(db, mouser, req.user, req.pass);
      if (upd.modifiedCount > 0) return("Success"); else return("");
    }

    )
    //Εντολές που υπάχουν για τη χρήση του check_admin στο site μέσω του server 

    abuse("/admin", async function (req) {
      console.log(req)
      return(await tools.Check_Admin(db, req.user, req.pass));
    }

    )
    //graphs and tables

    abuse("/basicstat", async function (req) {
      console.log(req)
      return(await tools.EveryStatistic(db));
    }

    )
    //graphs

    abuse("/macrostats", async function (req) {
      console.log(req)
      return(await tools.graphdata(db, req.dra));
    }

    )
    //graphs and tables

    abuse("/microstats", async function (req) {
      console.log(req)

      return(await tools.hourtostat(db, new Date(req.calendar)));
    }

    )


    //upload file
    abuse("/jsonPOIS", async function (req) {
      if (!req.files) { return("nofiles") }
      else {
        let myfile = req.files.jzon;
        console.log(myfile)
        myfile.mv("C:/Users/alekk/OneDrive/Desktop/project_Web/new_site/uploadedfiles/" + myfile.name, e =>
          tools.json_file_function(db, "C:/Users/alekk/OneDrive/Desktop/project_Web/new_site/uploadedfiles/" + myfile.name)
        );
        return("olaok")
      }

    })

    // επικοινωνία του server με το database για την κλήση του delete_POIs()

    abuse("/hiroshima", async function (req) {
      tools.delete_POIs(db);
      return("its done.");
    }

    )
    //website port
    app.listen(4545);
  })