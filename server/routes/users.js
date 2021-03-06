var express = require('express');
var router = express.Router();
var User = require('../models/User');



router.get('/new', function (req, res) {
  var userPos = req.body.userPos;
  var email = req.body.email;
  var password = req.body.password;
  // add more variables
  // 1. type 사업회원/일반회원
  // 2. email (=ID)
  // 3. pw

  User.create(req.body, function(err, user){
    if(err){
      req.flash('user', req.body);
      req.flash('errors', util.parseError(err));


      return res.redirect('/');
    }
    res.redirect('/');
  });
});

// destroy
router.get('/delete/:username', util.isAdmin,  function(req, res){

      User.deleteOne({username:req.params.username}, function(err){
      if(err) return res.json(err);

      res.redirect('/users');
  });
});

module.exports = router;
