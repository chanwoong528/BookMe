const express = require('express');
const mongoose = require('mongoose');

var flash = require('connect-flash'); // npm
const session = require('express-session'); // npm
const passport = require('./config/passport');//npm

const cors = require('cors');

var util = require('./libs/util');

const app = express();

// Socket server setting
var server = require('http').createServer(app);
var io = require('./libs/socket-listener').listen(server);
const dbUrl = 'mongodb+srv://BookMe:1234@cluster0.am9ya.mongodb.net/myFirstDatabase?retryWrites=true&w=majority'

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

// Custom Middlewares
app.use(function (req, res, next) {
  res.locals.isAuthenticated = req.isAuthenticated();
  res.locals.currentUser = req.user;
  res.locals.passKey = req.passKey;
  next();
});

// Other settings
app.use(express.static(__dirname + '/public'));
app.use(cors());
app.use(express.json());

// Passport
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
// app.use('/login', require('./routes/login'));

// Port setting
var port = process.env.PORT || 3001;
server.listen(port, function () {
  console.log('server on! http://localhost:' + port);
});
