const mongo=require("mongodb");
const mongoClient = mongo.MongoClient;
var tools = require('./functions.js');

mongoClient.connect('mongodb+srv://panos:5555p@cluster30.et1yr.mongodb.net/test')
  .then(client => {
  	db = client.db('example')
   tools.sort_dangerous_POI_types(db)

})

