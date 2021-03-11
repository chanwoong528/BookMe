require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const passport = require('./config/passport');//npm

const cors = require('cors');

var util = require('./libs/util');
const { env } = require('process');

const app = express();

// Socket server setting
var server = require('http').createServer(app);
var io = require('./libs/socket-listener').listen(server);
const dbUrl = process.env.DB_URL;

// DB setting
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);
mongoose.connect(dbUrl);
var db = mongoose.connection;
db.once('open', function () {
  console.log('DB connected');
});
db.on('error', function (err) {
  console.log('DB ERROR : ', err);
});





// Other settings
app.use(express.static(__dirname + '/public'));
app.use(cors());
app.use(express.json());

app.use(passport.initialize());
app.use(passport.session());


// Custom Middlewares
// app.use(function (req, res, next) {
//   res.locals.isAuthenticated = req.isAuthenticated();
//   res.locals.currentUser = req.user;
//   res.locals.passKey = req.passKey;
//   next();
// });

// Routes
app.use('/users', require('./routes/users'));

// Port setting
var port = process.env.PORT;
server.listen(port, function () {
  console.log('server on! http://localhost:' + port);
});
