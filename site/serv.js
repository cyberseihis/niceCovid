const express=require("express");
const app=express();
const mongo=require("mongodb");
const bodyParser = require("body-parser");
const cors = require('cors');
const mongoClient = mongo.MongoClient;
let db;
let POICollection;

async function searchPOIs (poiType,clientCoords){
    let cursorPOI= await POICollection.find({
        types: poiType,
        coordinates:{            
            $near:{
                $geometry:{
                    type: "Point",coordinates:clientCoords
                },
            $maxDistance:60
        }}
    }).toArray();
    return cursorPOI;
}

mongoClient.connect('mongodb+srv://panos:5555p@cluster30.et1yr.mongodb.net/test')
  .then(client => {
    
    db = client.db('example')
    POICollection = db.collection('exmpl1')
    

    // searchPOIs("cafe",[38.2379767,21.7259916]).toArray().then(results => {
    //     console.log(results)
    //   })
    //   .catch(error => console.error(error))

    // app.get('/search',async function (req,res){
    //     res.json(await searchPOIs(req.query.searchBar,[38.2379767, 21.7259916]));
    //     res.end();
    // })
    app.use("/static",express.static("/home/dabbing/Documents/vscopium/niceCovid/site/"))
    // app.use("/search",cors());
    app.use("/api",bodyParser.urlencoded({ extended: false }),bodyParser.json());
    app.get("/api/pois",async function(req,res){
        res.json(await searchPOIs(req.query.type,[38.2379767, 21.7259916]));
        res.end();
    })

    app.listen(4545);
  })