const mongo=require("mongodb");
const mongoClient = mongo.MongoClient;
var tools = require('./functions.js');

mongoClient.connect('mongodb+srv://panos:5555p@cluster30.et1yr.mongodb.net/test')
  .then(async function(client) {
  	db = client.db('example')
    dvisits=await tools.hourtostat(db,new Date("2022-09-04"));
    
    console.log(dvisits)
})

