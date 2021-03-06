var mongoose = require('mongoose');
var bcrypt = require('bcryptjs'); // 1

// schema
var userSchema = mongoose.Schema({
  userPos:{
    type:String,
    required: true
  },
  userEmail:{
    type:String,
    match:[/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,'이메일 형식에 맞게 입력해주세요.'],
    unique: true,
    trim:true,
    required: true
  },
  password:{
    type:String,
    required:[true,'비밀번호를 입력해주세요.'],
    select:false
  },
},{
  toObject:{virtuals:true}
});

// virtuals
userSchema.virtual('passwordConfirmation')
  .get(function(){ return this._passwordConfirmation; })
  .set(function(value){ this._passwordConfirmation=value; });

userSchema.virtual('originalPassword')
  .get(function(){ return this._originalPassword; })
  .set(function(value){ this._originalPassword=value; });

userSchema.virtual('currentPassword')
  .get(function(){ return this._currentPassword; })
  .set(function(value){ this._currentPassword=value; });

userSchema.virtual('newPassword')
  .get(function(){ return this._newPassword; })
  .set(function(value){ this._newPassword=value; });

  // password validation
  var passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{4,16}$/;
  var passwordRegexErrorMessage = '4 글자 이상의 영문 숫자 조합이어야 합니다.';
  userSchema.path('password').validate(function(v)
  {

    var user = this;


    // create user
    // if(user.isNew){
    //     if(!user.passwordConfirmation){
    //       user.invalidate('passwordConfirmation', '비밀번호를 한번 더 입력해주세요.');
    //     }
    //
    //     if(!passwordRegex.test(user.password)){
    //       user.invalidate('password', passwordRegexErrorMessage);
    //     }
    //     else if(user.password !== user.passwordConfirmation) {
    //       user.invalidate('passwordConfirmation', '비밀번호가 일치하지 않습니다.');
    //     }
    //   }
    // update user
    // if(!user.isNew){
    //    if(!user.currentPassword){
    //      user.invalidate('currentPassword', '현재 사용중인 비밀번호를 입력해주세요.');
    //    }
    //    else if(!bcrypt.compareSync(user.currentPassword, user.originalPassword)){
    //      user.invalidate('currentPassword', '현재 비밀번호를 확인해주세요.');
    //    }
    //
    //    if(user.newPassword && !passwordRegex.test(user.newPassword)){
    //      user.invalidate("newPassword", passwordRegexErrorMessage);
    //    }
    //    else if(user.newPassword !== user.passwordConfirmation) {
    //      user.invalidate('passwordConfirmation', '비밀번호가 일치 하지 않습니다.');
    //    }
    //  }
   });


   // hash password // 3
   userSchema.pre('save', function (next){
     var user = this;
     if(!user.isModified('password')){ // 3-1
       return next();
     }
     else {
       user.password = bcrypt.hashSync(user.password); //3-2
       return next();
     }
   });
   // model methods // 4
  userSchema.methods.authenticate = function (password) {
    var user = this;
    return bcrypt.compareSync(password,user.password);
  };
  var User = mongoose.model('user',userSchema);
  // model & export

  module.exports = User;
