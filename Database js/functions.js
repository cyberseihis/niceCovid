const mongo = require("mongodb");
const mongoClient = mongo.MongoClient;

//const { isContext } = require("vm");

module.exports = {
    User_insertion: User_insertion,
    Add_visit: Add_visit,
    Overwrite_population: Overwrite_population,
    Catch_covid: Catch_covid,
    check_within_14_days: check_within_14_days,
    recent_visits: recent_visits,
    adjacent_visitors: adjacent_visitors,
    temporaly_sick: temporaly_sick,
    recent_covid: recent_covid,
    are_you_a_threat: are_you_a_threat,
    edit_user: edit_user,
    change_POIs: change_POIs,
    json_file_function: json_file_function,
    delete_POIs: delete_POIs,
    total_count_visits: total_count_visits,
    total_count_covids: total_count_covids,
    dangerous_visits: dangerous_visits,
    sortPOI_types: sortPOI_types,
    sort_dangerous_POI_types: sort_dangerous_POI_types,
    visit_count_per_day: visit_count_per_day,
    dangerous_visit_count_per_day: dangerous_visit_count_per_day,
    Check_creds: Check_creds,
    visit_count_per_hour: visit_count_per_hour,
    dangerous_visit_count_per_hour: dangerous_visit_count_per_hour,
    searchPOIs: searchPOIs,
    population_estimation: population_estimation,
    PoiIdToName: PoiIdToName,
    VisitToLine: VisitToLine,
    all_my_visits: all_my_visits,
    all_my_sickness: all_my_sickness,
    Check_Admin: Check_Admin,
    EveryStatistic: EveryStatistic,
    graphdata: graphdata,
    hourtostat:hourtostat
}

async function searchPOIs(db, poiType, clientCoords) {
    let cursorPOI = await db.collection('POIs').find({
        types: poiType,
        coordinates: {
            $near: {
                $geometry: {
                    type: "Point", coordinates: clientCoords
                },
                $maxDistance: 5000
            }
        }
    }).toArray();
    return cursorPOI;
}

const asyncFilter = async (arr, predicate) =>
    arr.reduce(async (memo, e) =>
        await predicate(e) ? [...await memo, e] : memo
        , []);

//USER

function Check_creds(db, usr_name, usr_password) {
    var myobj = { name: usr_name, password: usr_password };
    let hm = db.collection("User").findOne(myobj);
    return hm
}

async function Check_Admin(db, adm_name, adm_password) {
    var myobj = { name: adm_name, password: adm_password };
    let hm = await db.collection("Admins").findOne(myobj);
    return hm
}


function User_insertion(db, usr_name, usr_email, usr_password) {
    var myobj = { name: usr_name, password: usr_password, email: usr_email };
    hmm = db.collection("User").insertOne(myobj)
    return hmm
}

function Add_visit(db, User_id, POI_Id) {
    var myobj = { user_id: User_id, POI_id: POI_Id, timestamp: new Date() };
    db.collection("Visit").insertOne(myobj, function (err, res) {
        if (err) throw err;
        console.log("1 visit inserted");
    })
}

function Overwrite_population(db, POI_Id, population) {
    d = new Date();
    let day = (7 + d.getDay() - 1) % 7;
    let hour = d.getHours();
    let ppp = "populartimes." + day + ".data." + hour;
    var new_values = { $set: { [ppp]: population } }
    var myobj = { _id: POI_Id };
    db.collection("POIs").updateOne(myobj, new_values, function (err, res) {
        console.log(ppp);
        if (err) throw err;
        console.log("1 POI changed");
    })
}

async function population_estimation(db, POI_Id, covid_time) {
    d = covid_time;
    let hour = d.getHours();
    dp = new Date(d.getTime());
    d.setHours(hour - 2);
    var myobj = { POI_id: POI_Id, timestamp: { $gte: d } };
    return await db.collection('Visit').find(myobj).toArray();
}

function Catch_covid(db, User_id, pos_test_date) {
    var myobj = { user_id: User_id, Date: pos_test_date };
    db.collection("Covid_case").insertOne(myobj, function (err, res) {
        if (err) throw err;
        console.log("1 covid_case inserted");
    })
}

async function check_within_14_days(db, User_Id) {
    let date = new Date();
    date.setDate(date.getDate() - 14)
    var myobj = { user_id: User_Id, Date: { $gte: date, $lt: new Date() } };
    var result = await db.collection("Covid_case").findOne(myobj);
    return (result != null)
}

function recent_visits(db, User_Id) {
    let date = new Date();
    date.setDate(date.getDate() - 7);
    var myobj = { user_id: User_Id, timestamp: { $gte: date, $lt: new Date() } };
    var result = db.collection("Visit").find(myobj).toArray();
    return result;
}

async function adjacent_visitors(db, POI_Id, covid_time) {
    d = covid_time;
    let hour = d.getHours();
    dp = new Date(d.getTime());
    d.setHours(hour - 2);
    dp.setHours(hour + 2);
    var myobj = { POI_id: POI_Id, timestamp: { $gte: d, $lt: dp } };
    return await db.collection('Visit').find(myobj).toArray();
}

async function temporaly_sick(db, UserId, covidTime) {
    d = covidTime;
    let date_d = d.getDate();
    dp = new Date(d.getTime());
    dp.setDate(date_d + 7);
    var myobj = { user_id: UserId, Date: { $gte: d, $lt: dp } };
    let hm = await db.collection('Covid_case').find(myobj).toArray();
    if (hm.length == 0) return false; else return true;
}

async function tem_si_help(db, adv) {
    let usid = adv.user_id;
    let tim = adv.timestamp;
    return await temporaly_sick(db, usid, tim);
}

async function are_you_a_threat(db, User_id) {
    /*db.collection('Visit').aggregate([
        {$match: {user_id: User_id}},
        {$addFields: {coviddat: "$dangerousVisits.Date"}},
        {
            $project : { _id : 0, coviddat :1, timestamp:1,
                weeksick : {$dateSubtract:
                    {
                       startDate: new Date(),
                       unit: "day",
                       amount: 7
                    }}
            }
        },
        {$match:{$expr:{$gt:["$timestamp", "$weeksick"]}}},
        { $addFields : { foundation_year : { $lookup:
            {
              from: 'Visit',
              localField: 'POI_id',
              foreignField: 'POI_id',
              as: 'same_pois'
            } } } }
    ]).toArray(function(err, res) {
        if (err) throw err;
        console.log(res);
})*/

    async function hellp(a) { return tem_si_help(db, a) };

    rev = await recent_visits(db, User_id);
    console.log("recentvisits",rev)
    async function isvisitdanger(x) {
        let pid = x.POI_id;
        let tim = x.timestamp;
        let advs = await adjacent_visitors(db, pid, tim);
        //console.log(advs)
        sickos=await asyncFilter(advs, hellp)
        //console.log(sickos);
        if(sickos.length>0) return true; else return false;
    }
    return await asyncFilter(rev, isvisitdanger);

}

async function PoiIdToName(db,poiid){
    let cursorPOI = await db.collection('POIs').find({
        _id: poiid
    }).toArray();
    return cursorPOI[0].name;
}

async function VisitToLine(db,viss){
    el={location:await PoiIdToName(db,viss.POI_id),time:viss.timestamp}
    return el
}

function recent_covid(db, UseriD) {
    var myobj = { user_id: UseriD };
    db.collection('Visit').find(myobj).toArray(function (err, res) {
        if (err) throw err;
        console.log(res);
    })
}

async function edit_user(db, Usrid, user_name, user_pass) {
    var myobj = { _id: Usrid }
    var new_values = { $set: { name: user_name, password: user_pass } }
    tre =  await db.collection("User").updateOne(myobj, new_values);
    return tre;
}

function all_my_visits(db, User_Id) {
    
    var myobj = { user_id: User_Id} ;
    var result = db.collection("Visit").find(myobj).sort( { "timestamp": -1 } ).toArray();
    return result;
}

function all_my_sickness(db, User_Id) {
    
    var myobj = { user_id: User_Id} ;
    var result = db.collection("Covid_case").find(myobj).sort( { "Date": -1 } ).toArray();
    return result;
}

//ADMIN

function change_POIs(db, jsonPOI) {
    db.collection("POIs").updateOne({ id: jsonPOI.id }, { "$set": jsonPOI },
        {
            "upsert": true
        },
        function (err, res) {
            if (err) throw err;
            console.log("POI details changed");
        })
}

function json_file_function(db, path) {
    const fs = require('fs');
    var data = JSON.parse(fs.readFileSync(path));
    bulk = db.collection("POIs").initializeUnorderedBulkOp();
    for (let i = 0; i < data.length; i++) {
        
        bulk.find( { id: data[i].id } ).upsert().update( { "$set": data[i] } );
    }
   
    bulk.execute();
}

function delete_POIs(db) {
    db.collection("POIs").remove(
        {}, function (err, res) {
            if (err) throw err;
            console.log("All POIs removed");
        })
}

async function total_count_visits(db) {
    var num = await db.collection("Visit").count();
    return num;
}

async function total_count_covids(db) {
    var num = await db.collection("Covid_case").count();
    return num;
}

async function dangerous_visits(db) {
    j=await db.collection('Visit').aggregate([
        {
            $lookup:
            {
                from: 'Covid_case',
                localField: 'user_id',
                foreignField: 'user_id',
                as: 'dangerousVisits'
            }
        },
        { $unwind: '$dangerousVisits' },
        { $addFields: { coviddat: "$dangerousVisits.Date" } },
        {
            $project: {
                _id: 0, coviddat: 1, timestamp: 1,
                weeksick: {
                    $dateSubtract:
                    {
                        startDate: "$coviddat",
                        unit: "day",
                        amount: 7
                    }
                },
                doublesick: {
                    $dateAdd:
                    {
                        startDate: "$coviddat",
                        unit: "day",
                        amount: 14
                    }
                }
            }
        },
        { $match: { $and: [{ $expr: { $gt: ["$timestamp", "$weeksick"] } }, { $expr: { $lt: ["$timestamp", "$doublesick"] } }] } },
        { $count: 'total_covid_visits' }
    ]).toArray();
    return j[0].total_covid_visits;
}

async function sortPOI_types(db) {
    j= await db.collection('Visit').aggregate([
        {
            $lookup:
            {
                from: 'POIs',
                localField: 'POI_id',
                foreignField: '_id',
                as: 'same_pois'
            }
        },
        { $addFields: { Bpoi: { $first: "$same_pois" } } },
        {
            $project: { _id: 0, Bpoi: 1 }
        },
        { $addFields: { ffr: "$Bpoi.types" } },
        { $project: { ffr: 1 } },
        { $unwind: '$ffr' },
        { $group: { _id: '$ffr', totaldocs: { $sum: 1 } } },
        { $sort: { 'totaldocs': -1 } }
    ]).toArray();
    return j;
}

async function sort_dangerous_POI_types(db) {
    j=await db.collection('Visit').aggregate([
        {
            $lookup:
            {
                from: 'Covid_case',
                localField: 'user_id',
                foreignField: 'user_id',
                as: 'dangerous_visits'
            }
        },
        { $unwind: '$dangerous_visits' },
        { $addFields: { covdat: "$dangerous_visits.Date" } },
        {
            $project: {
                _id: 0, covdat: 1, POI_id: 1, timestamp: 1,
                weeksick: {
                    $dateSubtract:
                    {
                        startDate: "$covdat",
                        unit: "day",
                        amount: 7
                    }
                },
                doublesick: {
                    $dateAdd:
                    {
                        startDate: "$covdat",
                        unit: "day",
                        amount: 14
                    }
                }
            }
        },
        { $match: { $and: [{ $expr: { $gt: ["$timestamp", "$weeksick"] } }, { $expr: { $lt: ["$timestamp", "$doublesick"] } }] } },
        {
            $lookup:
            {
                from: 'POIs',
                localField: 'POI_id',
                foreignField: '_id',
                as: 'same_pois'
            }
        },
        { $addFields: { Bpoi: { $first: "$same_pois" } } },
        {
            $project: { _id: 0, Bpoi: 1 }
        },
        { $addFields: { ffr: "$Bpoi.types" } },
        { $project: { ffr: 1 } },
        { $unwind: '$ffr' },
        { $group: { _id: '$ffr', totaldocs: { $sum: 1 } } },
        { $sort: { 'totaldocs': -1 } }


    ]).toArray();
    return j;
}

async function visit_count_per_day(db, day) {
    j= await db.collection('Visit').aggregate([
        
        { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } }, numberOfVisits: { $sum: 1 } } },
        { $match: { _id: new Date(day).toISOString().split('T')[0]} },
    ]).toArray();
    return j.length==0?0:j[0].numberOfVisits;
}

async function dangerous_visit_count_per_day(db, day) {
    j= await db.collection('Visit').aggregate([
        {
            $lookup:
            {
                from: 'Covid_case',
                localField: 'user_id',
                foreignField: 'user_id',
                as: 'cov_cases'
            }
        },
        { $unwind: '$cov_cases' },
        { $addFields: { coviddat: "$cov_cases.Date" } },
        {
            $project: {
                _id: 0, coviddat: 1, timestamp: 1,
                weeksick: {
                    $dateSubtract:
                    {
                        startDate: "$coviddat",
                        unit: "day",
                        amount: 7
                    }
                },
                doublesick: {
                    $dateAdd:
                    {
                        startDate: "$coviddat",
                        unit: "day",
                        amount: 14
                    }
                }
            }
        },
        { $match: { $and: [{ $expr: { $gt: ["$timestamp", "$weeksick"] } }, { $expr: { $lt: ["$timestamp", "$doublesick"] } }] } },
        
        { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } }, numberOfDangerousVisits: { $sum: 1 } } },
        { $match: { _id: new Date(day).toISOString().split('T')[0]} },
        
    ]).toArray();
    return j.length==0?0:j[0].numberOfDangerousVisits;
}

async function visit_count_per_hour(db, day) {
    
    j= await db.collection('Visit').aggregate([
        
        { $project: { dai: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } } ,_id:0,timestamp:1} },
        {$match: {dai:new Date(day).toISOString().split('T')[0]}},
        { $group: { _id: { $hour: "$timestamp" }, n: { $sum: 1 } } },
        //{ $match: { _id: hour.getHours() } },
    ]).toArray();
    return j;
}

async function dangerous_visit_count_per_hour(db, hour) {
    return await db.collection('Visit').aggregate([
        { $project: { dai: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } } ,_id:0,timestamp:1,user_id:1} },
        {$match: {dai:new Date(hour).toISOString().split('T')[0]}},
        {
            $lookup:
            {
                from: 'Covid_case',
                localField: 'user_id',
                foreignField: 'user_id',
                as: 'cov_cases'
            }
        },
        { $unwind: '$cov_cases' },
        { $addFields: { coviddat: "$cov_cases.Date" } },
        {
            $project: {
                _id: 0, coviddat: 1, timestamp: 1,
                weeksick: {
                    $dateSubtract:
                    {
                        startDate: "$coviddat",
                        unit: "day",
                        amount: 7
                    }
                },
                doublesick: {
                    $dateAdd:
                    {
                        startDate: "$coviddat",
                        unit: "day",
                        amount: 14
                    }
                }
            }
        },
        { $match: { $and: [{ $expr: { $gt: ["$timestamp", "$weeksick"] } }, { $expr: { $lt: ["$timestamp", "$doublesick"] } }] } },
        { $match: { "timestamp": hour } },
        { $group: { _id: { $hour: "$timestamp" }, n: { $sum: 1 } } },

    ]).toArray()
}

async function EveryStatistic(db){
    return {
        a:await total_count_visits(db),
        b:await total_count_covids(db),
        c:await dangerous_visits(db),
        d:await sortPOI_types(db),
        e:await sort_dangerous_POI_types(db)
    }
}

function monthdays() {
    d= new Date();
    mont=[];
    d.setDate((d.getDate() - d.getDate() +1));
    for (var i = 0; i < 31; i++) {
        if(d.getMonth()===new Date().getMonth())
        mont.push(
            new Date(d)
        ); 
        d.setDate(d.getDate() +1);
    }
    return mont; 
}


  function weekdays() {
    d= new Date();
    week=[];
    d.setDate((d.getDate() - d.getDay() +1));
    for (var i = 0; i < 7; i++) {
        week.push(
            new Date(d)
        ); 
        d.setDate(d.getDate() +1);
    }
    return week; 
}

async function daytostat(db,day){
    return {date:day.toISOString().split('T')[0],visits:await visit_count_per_day(db,day),dvisits:await dangerous_visit_count_per_day(db,day)};
}

async function hourtostat(db,day){
    let vc= normHours(await visit_count_per_hour(db,day));
    let dc= normHours(await dangerous_visit_count_per_hour(db,day));
    lem=[];
    for(i=0;i<24;i++)lem.push({hou:i,vis:vc[i].n,dis:dc[i].n});
    return lem;
}

async function graphdata(db,datescope){
    dscope = datescope=="month"?monthdays:weekdays;
    datess=dscope();
    return await Promise.all(datess.map(e=>daytostat(db,e)));
}

function normHours(ar){
    lem=[];
    for(i=0;i<24;i++)lem.push(fidnhour(ar,i));
    return lem;
}

function fidnhour(ar,h){
for (x of ar){
    if (x._id==h)return x;
}
return {_id:h,n:0}
}




