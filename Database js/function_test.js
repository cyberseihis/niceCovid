const mongo=require("mongodb");
const mongoClient = mongo.MongoClient;
var tools = require('./functions.js');

mongoClient.connect('mongodb+srv://panos:5555p@cluster30.et1yr.mongodb.net/test')
  .then(async function(client) {
  	db = client.db('example')
    hm=  await tools.dangerous_visit_count_per_hour(db,new Date("2022-09-14"));
    console.log(hm)
})

