//This is used to test the functionabilty of the functions individually

const mongo=require("mongodb");
const mongoClient = mongo.MongoClient;
var tools = require('./functions.js');

mongoClient.connect('mongodb+srv://panos:5555p@cluster30.et1yr.mongodb.net/test')
  .then(async function(client) {
  	db = client.db('example')
    hm=  await tools.are_you_a_threat(db,mongo.ObjectId("62fbf36813f65684eee1746c"));
    console.log(hm)

    
})

