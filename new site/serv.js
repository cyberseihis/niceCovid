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

    app.post("/login", async function (req, res) {
      //res.json(await searchPOIs(req.body.searchBar,[38.2379767, 21.7259916]));
      console.log(req.body.user);
      console.log(req.body.pass);
      tools.Check_creds(db, req.body.user, req.body.pass).then(res.send.bind(res));
    })
    //Εντολές που χρησιμοποιούνται για την εισαγωγή των στοιχείων ενός χρήστη μέσω της σελίδας SignUp.

    app.post("/sign", async function (req, res) {

      tools.User_insertion(db, req.body.user, req.body.email, req.body.pass).then(res.send.bind(res)).catch(xx => { res.send("error_dup") })

    })
    //Εντολές που χρησιμοποιούνται για την εμφάνιση συγκεκριμένου αριθμού από markers(PΟΙs) στην κεντρική σελίδα(main page).

    app.post("/poi", async function (req, res) {

      POICollection.find().limit(20).toArray().then(res.send.bind(res))

    })
    //Εντολές που χρησιμοποιούνται για την εμφάνιση συγκεκριμένων POIs στην main page ,σύμφωνα με τον τύπο POI θα εισάγει ο χρήστης.

    app.post("/searchpoi", async function (req, res) {

      tools.searchPOIs(db, req.body.poitype, [38.2376827, 21.7259359]).then(res.send.bind(res))

    })
    //Εντολές που χρησιμοποιούνται για την εμφάνιση του ποσοστού επισκεψιμότητας σε ένα POI 
    //για συγκεκριμένη χρονική στιγμή που καθορίζεται από την  παρακάτω συνάρτηση.Τα δεδομένα εμφανίζονται στην main page.

    app.post("/nvisit", async function (req, res) {


      tools.population_estimation(db, mongo.ObjectId(req.body.pid), new Date()).then(res.send.bind(res))

    })
    //Εντολές που χρησιμοποιούνται για την εισαγωγή εκτίμησης επισκεψιμότητας POI.Τα δεδομένα εμφανίζονται στην main page.

    app.post("/visitor", async function (req, res) {
      console.log(req.body)
      tools.Add_visit(db, mongo.ObjectId(req.body.userid), mongo.ObjectId(req.body.poivisti))
      if (req.body.popnum != '') {
        tools.Overwrite_population(db, mongo.ObjectId(req.body.poivisti), Number(req.body.popnum))
      }
      res.end();

    })
    //Εντολές που χρησιμοποιούνται για την Δήλωση Κρούσματος στην σελίδα report.

    app.post("/report", async function (req, res) {
      console.log(req.body)
      if (await tools.check_within_14_days(db, mongo.ObjectId(req.body.userid))) res.send("You are already diagnosed sick!");
      else {
        tools.Catch_covid(db, mongo.ObjectId(req.body.userid), new Date(req.body.diagnosed));
        res.send("nice covid");
      }

    })
    //Εντολές που χρησιμοποιούνται για την λίστα των πιθανών επαφών στην σελίδα contacts.

    app.post("/threats", async function (req, res) {
      console.log(req.body)
      threts = await tools.are_you_a_threat(db, mongo.ObjectId(req.body.userid));
      res.send(await Promise.all(threts.map(e => tools.VisitToLine(db, e))));
    }

    )
    //Εντολές που χρησιμοποιούνται για τις λίστες των συνολικών επισκέψεων και των report του χρήστη στην σελίδα user_settings 

    app.post("/mystory", async function (req, res) {
      console.log(req.body)
      mouser = mongo.ObjectId(req.body.userid);
      av = await tools.all_my_visits(db, mouser);
      avisits = await Promise.all(av.map(e => tools.VisitToLine(db, e)));
      asicks = await tools.all_my_sickness(db, mouser);
      drakes = asicks.map(as => { return { s: as.Date.toLocaleString() } });
      res.send({ allvisits: avisits, allsick: drakes });
    }

    )

    //Εντολές που καθιστούν δυνατή την αλλαγή των στοιχείων του χρήστη 

    app.post("/settings", async function (req, res) {
      console.log(req.body)
      mouser = mongo.ObjectId(req.body.userid);
      upd = await tools.edit_user(db, mouser, req.body.user, req.body.pass);
      if (upd.modifiedCount > 0) res.send("Success"); else res.send("");
    }

    )
    //Εντολές που υπάχουν για τη χρήση του check_admin στο site μέσω του server 

    app.post("/admin", async function (req, res) {
      console.log(req.body)
      res.send(await tools.Check_Admin(db, req.body.user, req.body.pass));
    }

    )
    //graphs and tables

    app.post("/basicstat", async function (req, res) {
      console.log(req.body)
      res.send(await tools.EveryStatistic(db));
    }

    )
    //graphs

    app.post("/macrostats", async function (req, res) {
      console.log(req.body)
      res.send(await tools.graphdata(db, req.body.dra));
    }

    )
    //graphs and tables

    app.post("/microstats", async function (req, res) {
      console.log(req.body)

      res.send(await tools.hourtostat(db, new Date(req.body.calendar)));
    }

    )


    //upload file
    app.post("/jsonPOIS", async function (req, res) {
      if (!req.files) { res.send("nofiles") }
      else {
        let myfile = req.files.jzon;
        console.log(myfile)
        myfile.mv("C:/Users/alekk/OneDrive/Desktop/project_Web/new_site/uploadedfiles/" + myfile.name, e =>
          tools.json_file_function(db, "C:/Users/alekk/OneDrive/Desktop/project_Web/new_site/uploadedfiles/" + myfile.name)
        );
        res.send("olaok")
      }

    })

    // επικοινωνία του server με το database για την κλήση του delete_POIs()

    app.post("/hiroshima", async function (req, res) {
      tools.delete_POIs(db);
      res.send("its done.");
    }

    )
    //website port
    app.listen(4545);
  })