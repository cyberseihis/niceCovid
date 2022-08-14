const mongo=require("mongodb");
const mongoClient = mongo.MongoClient;
const dayjs = require('dayjs')

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
    are_you_a_threat : are_you_a_threat,
    edit_user : edit_user,
    change_POIs : change_POIs,
    json_file_function : json_file_function,
    delete_POIs : delete_POIs,
    total_count_visits : total_count_visits,
    total_count_covids : total_count_covids,
    dangerous_visits : dangerous_visits,
    sortPOI_types : sortPOI_types,
    sort_dangerous_POI_types : sort_dangerous_POI_types,
    visit_count_per_day : visit_count_per_day,
    dangerous_visit_count_per_day : dangerous_visit_count_per_day,
    Check_creds: Check_creds
}

//USER

function Check_creds(db,usr_name,usr_password){
    var myobj = { name: usr_name , password: usr_password};
    let hm = db.collection("User").findOne(myobj);
    return hm
}


function User_insertion(db,usr_name,usr_email,usr_password){  
    var myobj = { name: usr_name , password: usr_password , email: usr_email};
    db.collection("User").insertOne(myobj, function(err, res) {
    //if (err) throw err;
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
    date.setDate(date.getDate() - 7);
    var myobj = {user_id: User_Id, timestamp:{$gte:date,$lt : new Date()}};
    var result = db.collection("Visit").find(myobj).toArray();
    return result;
}

function adjacent_visitors(db,POI_Id,covid_time){
    d = covid_time;
    let hour = d.getHours();
    dp = new Date(d.getTime());
    d.setHours(hour - 2);
    dp.setHours(hour + 2);
    var myobj = {POI_id: POI_Id,timestamp:{$gte:d,$lt : dp}};
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
    var myobj = {user_id: UserId,Date:{$gte:d,$lt : dp}};
      db.collection('Covid_case').find(myobj).toArray(function(err, res) {
        if (err) throw err;
        console.log(res);
})
}

function are_you_a_threat(db,User_id){
    recent_visits(db,User_id).then(rec_visit=>{
    for (i=0;i<rec_visit.length;i++){
        adjacent_visitors(db,POI_Id,timestamp)
    }
}
    ).then(adj_visitors=>{
    temporaly_sick(db,UserId,covidTime)    
}
    )
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

//ADMIN

function change_POIs(db,jsonPOI){
    db.collection("POIs").updateOne({id : jsonPOI.id},{"$set":jsonPOI},
    {
        "upsert":true
    },
    function(err, res) {
        if (err) throw err;
        console.log("POI details changed");
    })
}

function json_file_function(db,path){
    const fs = require('fs');
    var data = JSON.parse(fs.readFileSync(path));
    for (let i=0; i<data.length;i++){
        change_POIs(db,data[i]);
    }
}

function delete_POIs(db){
    db.collection("POIs").remove(
        {},function(err, res) {
            if (err) throw err;
            console.log("All POIs removed");
        })
}

function total_count_visits(db){
    var num = db.collection("Visit").count();
    return num;
}

function total_count_covids(db){
    var num = db.collection("Covid_case").count();
    return num;
}

function dangerous_visits(db){
    db.collection('Visit').aggregate([
        { $lookup:
           {
             from: 'Covid_case',
             localField: 'user_id',
             foreignField: 'user_id',
             as: 'dangerousVisits'
           }
         },
        { $unwind : '$dangerousVisits' },
        {$addFields: {coviddat: "$dangerousVisits.Date"}},
        {
            $project : { _id : 0, coviddat :1, timestamp:1,
                weeksick : {$dateSubtract:
                    {
                       startDate: "$coviddat",
                       unit: "day",
                       amount: 7
                    }},
                doublesick : {$dateAdd:
                    {
                       startDate: "$coviddat",
                       unit: "day",
                       amount: 14
                    }}
            }
        },
        {$match:{$and:[{$expr:{$gt:["$timestamp", "$weeksick"]}},{$expr:{$lt:["$timestamp", "$doublesick"]}}]}},
        { $count : 'total_covid_visits' }
        ]).toArray(function(err, res) {
        if (err) throw err;
        console.log(res);
})
}

function sortPOI_types(db){
    db.collection('Visit').aggregate([
        { $lookup:
           {
             from: 'POIs',
             localField: 'POI_id',
             foreignField: '_id',
             as: 'same_pois'
           }
         },
         { $addFields: { Bpoi: { $first: "$same_pois" } } },
         {
            $project : { _id : 0, Bpoi :1}
         },
         {$addFields: {ffr: "$Bpoi.types"}},
         {$project : {ffr :1}},
         { $unwind : '$ffr' },
         { $group : { _id : '$ffr', totaldocs : { $sum : 1 } } },
         { $sort : { 'totaldocs' : -1 } }
        ]).toArray(function(err, res) {
        if (err) throw err;
        console.log(res);
})
}

function sort_dangerous_POI_types(){
    db.collection('Visit').aggregate([
        { $lookup:
            {
              from: 'Covid_case',
              localField: 'user_id',
              foreignField: 'user_id',
              as: 'dangerous_visits'
            }
        },
        { $unwind : '$dangerous_visits' },
        {$addFields: {covdat: "$dangerous_visits.Date"}},
        {
            $project : { _id : 0, covdat :1, POI_id : 1, timestamp:1,
                weeksick : {$dateSubtract:
                    {
                       startDate: "$covdat",
                       unit: "day",
                       amount: 7
                    }},
                doublesick : {$dateAdd:
                    {
                       startDate: "$covdat",
                       unit: "day",
                       amount: 14
                    }}
            }
         },
         {$match:{$and:[{$expr:{$gt:["$timestamp", "$weeksick"]}},{$expr:{$lt:["$timestamp", "$doublesick"]}}]}},
         { $lookup:
            {
              from: 'POIs',
              localField: 'POI_id',
              foreignField: '_id',
              as: 'same_pois'
            }
          },
          { $addFields: { Bpoi: { $first: "$same_pois" } } },
          {
             $project : { _id : 0, Bpoi :1}
          },
          {$addFields: {ffr: "$Bpoi.types"}},
          {$project : {ffr :1}},
          { $unwind : '$ffr' },
          { $group : { _id : '$ffr', totaldocs : { $sum : 1 } } },
          { $sort : { 'totaldocs' : -1 } }
         

        ]).toArray(function(err, res) {
        if (err) throw err;
        console.log(res);
})
}

function visit_count_per_day(db){
        db.collection('Visit').aggregate([
            {$group:{ _id:{$dateToString:{format: "%Y-%m-%d", date: "$timestamp"}}, numberOfVisits:{ $sum: 1}}},
    ]).toArray(function(err, res) {
        if (err) throw err;
        console.log(res);
})
}

function dangerous_visit_count_per_day(db){
    db.collection('Visit').aggregate([
    { $lookup:
        {
          from: 'Covid_case',
          localField: 'user_id',
          foreignField: 'user_id',
          as: 'cov_cases'
        }
    },
    { $unwind : '$cov_cases' },
    {$addFields: {coviddat: "$cov_cases.Date"}},
        {
            $project : { _id : 0, coviddat :1, timestamp:1,
                weeksick : {$dateSubtract:
                    {
                       startDate: "$coviddat",
                       unit: "day",
                       amount: 7
                    }},
                doublesick : {$dateAdd:
                    {
                       startDate: "$coviddat",
                       unit: "day",
                       amount: 14
                    }}
            }
        },
        {$match:{$and:[{$expr:{$gt:["$timestamp", "$weeksick"]}},{$expr:{$lt:["$timestamp", "$doublesick"]}}]}},
        {$group:{ _id:{$dateToString:{format: "%Y-%m-%d", date: "$cov_cases.timestamp"}},numberOfDangerousVisits:{ $sum: 1}}},
        {$project : {_id : 0,numberOfDangerousVisits : 1}}
    ]).toArray(function(err, res) {
       if (err) throw err;
       console.log(res);
})
}

/*function dangerous_visit_count_per_day2(db){
    db.collection('Covid_case').aggregate([
    { $lookup:
        {
          from: 'Visit',
          localField: 'user_id',
          foreignField: 'user_id',
          as: 'cov_cases'
        }
    },
    { $unwind : '$cov_cases' },

    {$group:{ _id:{$dateToString:{format: "%Y-%m-%d", date: "$dangerous_visits.timestamp"}},numberOfDangerousVisits:{ $sum: 1}}}
    ]).toArray(function(err, res) {
       if (err) throw err;
       console.log(res);
})
}*/







