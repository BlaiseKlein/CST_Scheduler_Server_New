//Require imports
const express = require('express');
const session = require('express-session');
const admin = require("firebase-admin");
const db = require('./db');
const cors = require('cors');
var bodyParser = require('body-parser')
const app = express();

//Port used: 3001
const PORT = process.env.PORT || 3001;

//Cors setup
app.use(cors({
    origin: 'http://localhost:3000'
}));
app.use(bodyParser.json());
// var corsOptions = {
//     origin: 'http://localhost:3000/',
//     optionsSuccessfulStatus: 200
// }

//Firebase Setup
const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue, Filter } = require('firebase-admin/firestore');
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const fierbaseConfig = process.env.FIREBASE;


//Setup user database call
async function getUser(db) {
    try {
        const users = db.collection('users').doc('testuser');
        const data = await users.get();
        // console.log(data.data());
        return data.data();
    } catch(err) {
        return err;
    }
}

//Development DB Shortcuts
const userDB = db.collection('users').doc('newUser');

//Default get call
app.get("/", (req, res) => {
    res.json({message: "This is the server"});
});

//Test get call
app.get("/test", (req, res) => {
    res.json({message: "This is a test"});
    console.log("this worked");
});

//Returns the events for the selected schedule item
app.get("/course/:name", async (req, res) => {
    const date1 = new Date('January 17, 2023 03:24:00');
    const date2 = new Date('January 24, 2023 03:24:00');
    const course1 = {title: "Math 1002", events: [{day: date1, description: "Math test"}, {day: date2, description: "Math Assignment1"}]};
    const course2 = {title: "Comp 2151", events: [{day: date1, description: "Comp test"}, {day: date2, description: "Comp Assignment1"}]};

    //**Replace with a server search later when DB is setup **
    // if (req.query.course === "Math 1002"){
    //     res.json(JSON.stringify(course1));
    // } else if (req.query.course === "Comp 2151") {
    //     res.json(JSON.stringify(course2));
    // }

    //Database Search
    const queryRef = userDB.collection('courses');
    const queryResults = await queryRef.where('title', '==', req.params.name).get();
    // console.log(queryResults);
    var send = {};
    queryResults.forEach(doc => {
        console.log(doc.id, '=>', doc.data());
        send = doc.data();
    })
    res.json(JSON.stringify(send));
});

//Returns the schedule for a day of the week.
app.get("/schedule/:day", async (req, res) => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const date1 = new Date('January 17, 2023 03:24:00');
    const date2 = new Date('January 24, 2023 03:24:00');
    const schedule = [{title: "Math 1002", start: "0900", end: "1000", events: [{day: date1.getDate(), description: "Math test"}, {day: date2.getDate(), description: "Math Assignment1"}]}, {title: "COMP 2151", start: "1500", end: "1600", events: [{day: date1.getDate(), description: "Comp test"}, {day: date2.getDate(), description: "Comp Assignment1"}]}];
    const items = await userDB.collection('courses').where('day', '==', days[req.params.day]).get();
    // console.log(items.data());
    var send = [];
    items.forEach(doc => {
        console.log(doc.id, '=>', doc.data());
        send = [...send, doc.data()];
      });
    res.json(JSON.stringify(send));
});

//Fake post information get call
app.get("/fakePost", (req, res) => {
    const toReturn = {title: "This is a title", description: "this is a test description", date: "09/17/2023", time: "5:00am"};
    const date1 = new Date('January 17, 2023 03:24:00');
    const date2 = new Date('January 18, 2023 03:24:00');
    const testArray = ['this is a title', 'this is a test array', date1, '5:00am'];
    const testArray2 = ['this is a title', 'this is a test array', date2, '6:00am'];
    const arrayJSON = JSON.stringify([testArray[2].getDay(), testArray2[2].getDay()]);
    res.json(arrayJSON);
});

//Depricated Schedule response
app.get("/getSchedule", async (req, res) => {
    const courseDB = await userDB.collection('courses').get();
    var send = [];
    courseDB.forEach(doc => {
        console.log(doc.id, '=>', doc.data());
        send = [...send, doc.data().title];
      });
    res.json(JSON.stringify(send));
})

//Basic post test
app.post("/postTest", cors(), (req, res) => {
    console.log("worked"); 
    console.log(req.body);
    res.json({return: 'yes'});
})

//Adds a new item to the users schedule, stored in the db
app.post("/schedulePost", cors(), async (req, res) => {
    console.log(req.body);
    console.log("type: " + typeof req.body);
    const setter = await userDB.collection('courses').doc(req.body.title).set(req.body);
    res.json({return: 'yes'});
})

//Add a new event to a course in the users schedule, stored in the db
app.post("/eventPost", cors(), async (req, res) => {
    console.log(req.body);
    console.log("type: " + typeof req.body);
    const setter = await userDB.collection('courses').doc(req.body.event).update({events: FieldValue.arrayUnion(req.body)});
    res.json({return: 'yes'});
})

//Basic listen
app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
    getUser(db);
});