const mongo=require("mongodb");
const mongoClient = mongo.MongoClient;
var tools = require('./functions.js');

mongoClient.connect('mongodb+srv://panos:5555p@cluster30.et1yr.mongodb.net/test')
  .then(client => {
  	db = client.db('example')
  	tools.edit_user(db,mongo.ObjectId("62d915c84097abadc98783f3"),"George Lekkas","1234");
})

