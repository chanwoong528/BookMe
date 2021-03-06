var express = require('express');
var router = express.Router();
var User = require('../models/User');
var util = require('../libs/util');


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

module.exports = router;
