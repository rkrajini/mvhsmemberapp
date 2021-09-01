const express = require("express");
const path = require('path');
const mysql = require("mysql");
const fileUpload = require('express-fileupload');
const cookieParser = require('cookie-parser');
const hbs = require('hbs');
const port = process.env.PORT || 3000;

var mysqlHost = process.env.MYSQL_HOST || 'localhost';
var mysqlPort = process.env.MYSQL_PORT || '3306';
var mysqlUser = process.env.MYSQL_USER || 'root';
var mysqlPass = process.env.MYSQL_PASS || 'root';
var mysqlDB   = process.env.MYSQL_DB   || 'node_db';

//this required before view engine setup
hbs.registerPartials(__dirname + '/views/partials');

// view engine setup


// dotenv.config({ path: './.env'});

const app = express();

const db = mysql.createConnection({
  host: mysqlUser,
  port: mysqlPort,
  user: mysqlUser,
  password: mysqlPass,
  database: mysqlDB
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
// hbs.registerHelper("noop", function(options) {
//   return options.fn(this);
// });

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
    console.log("Connected...to the DB")
  }
})

//Define Routes
app.use('/', require('./routes/pages'));
app.use('/auth', require('./routes/auth'));
app.use('/auth/login', require('./routes/auth'))

// app.get('/', (req, res) => {
//    res.redirect('/login');
// })

app.listen(port, () => {
  console.log(`MVHS Member app listening at http://localhost:${port}`)
})


