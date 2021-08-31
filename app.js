const express = require("express");
const path = require('path');
const mysql = require("mysql");
const dotenv = require('dotenv');
const fileUpload = require('express-fileupload');
const cookieParser = require('cookie-parser');
const hbs = require('hbs');

//this required before view engine setup
hbs.registerPartials(__dirname + '/views/partials');

// view engine setup


dotenv.config({ path: './.env'});

const app = express();

const db = mysql.createConnection({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE
});

app.use(fileUpload());

const publicDirectory = path.join(__dirname, './public');
app.use(express.static(publicDirectory));
const uploadDirectory = path.join(__dirname, './upload');
app.use(express.static(uploadDirectory));

// Parse URL-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded({ extended: false }));
// Parse JSON bodies (as sent by API clients)
app.use(express.json());
app.use(cookieParser());
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
hbs.registerHelper('ifCond', function(a, b, opts) {
  if (a == b) {
      return opts.fn(this)
  } else {
      return opts.inverse(this)
  }
});

db.connect( (error) => {
  if(error) {
    console.log(error)
  } else {
    console.log("Connected...")
  }
})

//Define Routes
app.use('/', require('./routes/pages'));
app.use('/auth', require('./routes/auth'));

app.listen(5003, () => {
  console.log("Server started on Port 5003");
})