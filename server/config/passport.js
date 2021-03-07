var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy; // 1
var User = require('../models/User');
var sio = require('../libs/socket-listener');

// serialize & deserialize User // 2
passport.serializeUser(function(user, done) {
  done(null, user.id);
});
passport.deserializeUser(function(id, done) {
  User.findOne({_id:id}, function(err, user) {
    done(err, user);
  });
});

// local strategy // 3
passport.use('local-login',
  new LocalStrategy({
      usernameField : 'userEmail',
      passwordField : 'password',
      passReqToCallback : true
    },
    function(req, userEmail, password, done) {
      User.findOne({userEmail:userEmail})
        .select({password:1, userEmail:1})
        .exec(function(err, user) {
          if (err) return done(err);

          if (user && user.authenticate(password)){ // user authentication successful
            return done(null, user, sio.newPassKey(user.userEmail));
          }
          else {
            req.flash('userEmail', userEmail);
            req.flash('errors', {login:'아이디나 비밀번호가 일치하지 않습니다.'});
            return done(null, false, null);
          }
        });
    }
  )
);

module.exports = passport;
