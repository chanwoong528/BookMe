var express = require('express');
var router = express.Router();
var User = require('../models/User');
var util = require('../libs/util');
const passport = require('passport');


router.post('/new', function (req, res) {
  var userPos = req.body.userPos;
  var userEmail = req.body.userEmail;
  var password = req.body.password;
  // add more variables
  // 1. type 사업회원/일반회원
  // 2. email (=ID)
  // 3. pw
  console.log("router post");
  User.create(req.body, function(err, user){
    if(err){
      // req.flash('user', req.body);
      // req.flash('errors', util.parseError(err));
      console.log(err);
      return res.send('고객 등록 실패');
    }
    res.send('고객 등록 완료');
  });
});

// destroy
router.get('/delete/:username', util.isAdmin,  function(req, res){

      User.deleteOne({username:req.params.username}, function(err){
      if(err) return res.json(err);

      res.send('-');
  });
});

// login
router.get('/login', function(req, res){
  var userEmail = req.flash('userEmail')[0];
  var errors = req.flash('errors')[0] || {};
  res.render('home/login', {
    userEmail: userEmail,
    errors: errors
  });
});

// login
// router.post('/login', function (req, res, next){
//
// });

router.post('/login', function(req, res, next) {
  var errors = {};
  var isValid = true;

  if (!req.body.userEmail) {
    isValid = false;
    errors.userEmail = 'User Email is required!';
  }
  if (!req.body.password) {
    isValid = false;
    errors.password = 'Password is required!';
  }

  if (isValid) {
    passport.authenticate('local-login', function(err, user, passKey) {
      if (err) { return next(err); }
      if (!user) { return res.send({loginStatus:false}); }

      req.login(user, function(err) {
        if (err) return next(err);
        return res.send({loginStatus:true});
      });

    })(req, res, next);
  } else {
    req.flash('errors', errors);
    return res.send({loginStatus:false});
  }
});

// logout
router.get('/logout', function(req, res) {
  req.logout();
  res.send('로그아웃 성공');
});

module.exports = router;
