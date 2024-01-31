const express = require('express');
const { MongoClient } = require("mongodb");
const app = express();
const bodyParser = require('body-parser');

const dotenv = require('dotenv').config();


const port =  3010;

const DB_URL = process.env.DB_URL;


const mentorRoute = require('./Router/mentor');
const studentRoute =  require('./Router/student')

app.use(bodyParser.json());

app.get('/',(req,res)=>{
res.json(`Hello`);
})

app.use('/mentor', mentorRoute);
app.use('/student', studentRoute);


app.listen(port, ()=>{
    console.log(`server is running in ${port}`)})

//mongodb+srv://devasaravanan2511:<password>@cluster0.wcghjqf.mongodb.net/
//GPBHicrSfBYGAKsx