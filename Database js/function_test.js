const mongo=require("mongodb");
const mongoClient = mongo.MongoClient;
var tools = require('./functions.js');

mongoClient.connect('mongodb+srv://panos:5555p@cluster30.et1yr.mongodb.net/test')
  .then(async function(client) {
  	db = client.db('example')
    tools.json_file_function(db,"C:/Users/alekk/OneDrive/Desktop/project_Web/αρχεια POI/starting_pois.json")
})

