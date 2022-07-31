const mongo=require("mongodb");
const mongoClient = mongo.MongoClient;

module.exports = {
    User_insertion : User_insertion,
    Add_visit : Add_visit,
    Overwrite_population : Overwrite_population,
    Catch_covid : Catch_covid,
    check_within_14_days : check_within_14_days,
    recent_visits : recent_visits,
    adjacent_visitors: adjacent_visitors,
    temporaly_sick: temporaly_sick,
    recent_covid : recent_covid,
    edit_user : edit_user
}
  
function User_insertion(db,usr_name,usr_email,usr_password){  
    var myobj = { name: usr_name , password: usr_password , email: usr_email};
    db.collection("User").insertOne(myobj, function(err, res) {
    if (err) throw err;
    console.log("1 user inserted");
})
}

function Add_visit(db,User_id,POI_Id){
    var myobj = { user_id: User_id , POI_id: POI_Id,timestamp :new Date()};
    db.collection("Visit").insertOne(myobj, function(err, res) {
        if (err) throw err;
        console.log("1 visit inserted");
    }) 
}

function Overwrite_population(db,POI_Id,population){
    d = new Date();
    let day = (7+ d.getDay() -1)%7;
    let hour = d.getHours();
    let ppp = "populartimes."+ day + ".data."+ hour;
    var new_values = { $set: {[ppp] : population}}
    var myobj = { _id: POI_Id};
    db.collection("POIs").updateOne(myobj,new_values,function(err, res) {
        console.log(ppp);
        if (err) throw err;
        console.log("1 POI changed");
    })
}

function Catch_covid(db,User_id,pos_test_date){
    var myobj = { user_id: User_id,Date : pos_test_date};
    db.collection("Covid_case").insertOne(myobj,function(err, res) {
        if (err) throw err;
        console.log("1 covid_case inserted");
    })
}

function check_within_14_days(db,User_Id){
    let date = new Date();
    date.setDate(date.getDate() - 14)
    var myobj = {user_id: User_Id, Date:{$gte:date,$lt : new Date()}};
    var result = db.collection("Covid_case").findOne(myobj,function(err, res) {
        if (err) throw err;
        console.log(res);
    })
}

function recent_visits(db,User_Id){
    
    let date = new Date();
    date.setDate(date.getDate() - 7)
    var myobj = {user_id: User_Id, timestamp:{$gte:date,$lt : new Date()}};
    var result = db.collection("Visit").find(myobj).toArray(function(err, res) {
        if (err) throw err;
        console.log(res);
    })
}

function adjacent_visitors(db,POI_Id,covid_time){
    d = covid_time;
    let hour = d.getHours();
    dp = new Date(d.getTime());
    d.setHours(hour - 2);
    dp.setHours(hour + 2);
    var myobj = { 
        POI_id: POI_Id,timestamp:{$gte:d,$lt : dp}
      };
      db.collection('Visit').find(myobj).toArray(function(err, res) {
        if (err) throw err;
        console.log(res);
})
}

function temporaly_sick(db,UserId,covidTime){
    d = covidTime;
    let date_d = d.getDate();
    dp = new Date(d.getTime());
    dp.setDate(date_d + 7);
    var myobj = { 
        user_id: UserId,Date:{$gte:d,$lt : dp}
      };
      db.collection('Covid_case').find(myobj).toArray(function(err, res) {
        if (err) throw err;
        console.log(res);
})
}

function recent_covid(db,UseriD){
    var myobj = { user_id: UseriD};
      db.collection('Visit').find(myobj).toArray(function(err, res) {
        if (err) throw err;
        console.log(res);
})
}

function edit_user(db,Usrid,user_name,user_pass){
    var myobj = {_id : Usrid}
    var new_values = { $set: {name : user_name, password : user_pass}}
    db.collection("User").updateOne(myobj,new_values,function(err, res) {
        if (err) throw err;
        console.log("User details changed");
    })
}