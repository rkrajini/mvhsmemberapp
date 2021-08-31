const express = require("express");
const path = require('path');
const mysql = require("mysql");
const fileUpload = require('express-fileupload');
const cookieParser = require('cookie-parser');
const hbs = require('hbs');
const port = process.env.PORT || 3000;

//this required before view engine setup
hbs.registerPartials(__dirname + '/views/partials');

// view engine setup


// dotenv.config({ path: './.env'});

const app = express();

const db = mysql.createConnection({
  host: 'mydatabaseservice.mysql.database.azure.com',
  user: 'ganesha',
  password: 'G@nesh@3154',
  database: 'members'
});

// app.use(fileUpload());

const publicDirectory = path.join(__dirname, './public');
app.use(express.static(publicDirectory));
const uploadDirectory = path.join(__dirname, './upload');
app.use(express.static(uploadDirectory));

// // Parse URL-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded({ extended: false }));
// // Parse JSON bodies (as sent by API clients)
app.use(express.json());
app.use(cookieParser());
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
hbs.registerHelper("noop", function(options) {
  return options.fn(this);
});

db.connect( (error) => {
  if(error) {
    console.log(error)
  } else {
    console.log("Connected...to the DB")
  }
})

//Define Routes
app.use('/', require('./routes/pages'));
app.use('/auth', require('./routes/auth'));

// app.get('/', (req, res) => {
//    res.redirect('/login');
// })

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})


