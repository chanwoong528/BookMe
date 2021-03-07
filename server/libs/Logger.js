var mongoose = require('mongoose');
var Chat = require('../models/Chat');
var User = require('../models/User');
var escapeUtil = require('./escapeUtil');
var dateUtil = require('./dateUtil');
var mustache = require('mustache');
var qs = require('./quick-sorter');

var Logger = function() {

};

Logger.prototype.logData = {}; // {chatId:[{userEmail:, msg:, date:},],}
Logger.prototype.nicknames = {}; // {userEmail:nickname,}
Logger.prototype.chatListByUser = {}; // {userEmail:{target:chatId,},}
Logger.prototype.chatMembers = {}; // {userEmail:[member1, member2,],}

Logger.prototype.init = async function() {
  try {
    var chats = await Chat.find({}).exec();
    chats.forEach((chat, i) => {
      Logger.prototype.track(chat);
    });
  } catch (err) {
    err.stack;
  }
}

Logger.prototype.getChatList = function(userEmail) {
  // if (!Logger.prototype.chatListByUser[userEmail]) {
  Logger.prototype.getDBChatList(userEmail); // this refreshes chatListByUser[userEmail]
  // }
  var data = Logger.prototype.chatListByUser[userEmail]; // {target:chatId, ...}
  var arr = new Array();
  var mirror = new Array();
  for (var target in data) {
    var target_userEmail = target;
    var chatId = data[target];
    var log = Logger.prototype.getLastLog(chatId); // {msg, date, stamp}
    var built = Logger.prototype.buildChatList(target_userEmail, log.msg, log.date);
    var mirror_date = log.date?log.date:-1;
    if (!arr[0]) {
      arr.push(built);
      mirror.push(mirror_date);
    } else if (mirror[0] <= mirror_date) {
      arr.unshift(built);
      mirror.unshift(mirror_date);
    } else if (mirror[mirror.length - 1] >= mirror_date){
      arr.push(built);
      mirror.push(mirror_date);
    } else {
      for (var i = 0; i <= mirror.length -1; i++) {
        if (mirror[i] >= mirror_date && mirror_date >= mirror[i+1]){
          arr.splice(i+1,0,built);
          mirror.splice(i+1,0,mirror_date);
          break;
        }
      }
    }
  }
  return arr.join('');
}

Logger.prototype.getDBChatList = function(userEmail){
  try {
    var chats = Chat.find({ userEmails: { $all: [userEmail] } }).exec();
    chats.forEach((chat, i) => {
      Logger.prototype.track(chat);
    });
  } catch (err) {
    err.stack;
  }
}

Logger.prototype.getChatId = async function(userEmail, target) {
  var chatId = '';
  if (!Logger.prototype.chatListByUser[userEmail]) {
    try {
      var chats = await Chat.find({ userEmails: { $all: [userEmail] } }).exec();
      chats.forEach((chat, i) => {
        Logger.prototype.track(chat);
        if (chat.userEmails.includes(userEmail) && chat.userEmails.includes(target)) {
          chatId = chat._id.toString();
        }
      });
      return chatId;
    } catch (err) {
      err.stack;
      return '';
    }
  } else if (!Logger.prototype.chatListByUser[userEmail][target]) {
    try {
      var chat = await Chat.findOne({ userEmails: { $all: [userEmail, target] } }).exec();
      if (chat) {
        Logger.prototype.track(chat);
        chatId = chat._id.toString();
        return chatId;
      }
    } catch (err) {
      err.stack;
      return '';
    }

  } else {
    chatId = Logger.prototype.chatListByUser[userEmail][target];
  }
  return chatId;
}

Logger.prototype.getChatMembers = function(chatId, userEmail){
  if (!chatId || !Logger.prototype.chatMembers[chatId]) return '';
  return Logger.prototype.chatMembers[chatId];
}

Logger.prototype.track = function(chat) {
  var chatId = chat._id.toString();
  var user1 = chat.userEmails[0];
  var user2 = chat.userEmails[1];
  // var log = chat.log;
  if (!Logger.prototype.logData[chatId]) {
    Logger.prototype.logData[chatId] = new Array();
    // if (log) {
    //   // if there is DB log, add them to logMap
    // }
  }
  chat.user_data.forEach((user, i) => {
    Logger.prototype.nicknames[chat.userEmails[i]] = chat.nicknames[i];
  });
  if (!Logger.prototype.chatMembers[chatId]) {
    Logger.prototype.chatMembers[chatId] = new Array();
    Logger.prototype.chatMembers[chatId].push(user1);
    Logger.prototype.chatMembers[chatId].push(user2);
  }
  if (!Logger.prototype.chatListByUser[user1]) {
    Logger.prototype.chatListByUser[user1] = {};
  }
  Logger.prototype.chatListByUser[user1][user2] = chatId;
  if (!Logger.prototype.chatListByUser[user2]) {
    Logger.prototype.chatListByUser[user2] = {};
  }
  Logger.prototype.chatListByUser[user2][user1] = chatId;
};

Logger.prototype.getRecentLog = function(chatId, userEmail, target, quantity) {
  if (!chatId && (!userEmail || !target)) return -1;
  var qty = quantity ? quantity : 50;
  var cid = chatId ? chatId : Logger.prototype.getChatId(userEmail, target);
  if (cid == '') return 0;
  var logEntry = Logger.prototype.logData[cid];
  var log = '';
  if (logEntry != null && logEntry !== undefined) {
    var start = logEntry.length - 1;
    var until = start - qty;
    var end = until > 0 ? until : 0;
    for (var i = start; i >= end; i--) {
      isMyMsg = logEntry[i].userEmail == userEmail;
      // starting from most recent, prepend
      var data = {
        userEmail: logEntry[i].userEmail,
        msg: logEntry[i].msg,
        date: logEntry[i].date,
      };
      log = Logger.prototype.buildMessage(data, isMyMsg) + log;
    }
  }
  return log;
}

Logger.prototype.getLastLog = function(chatId, fromDB) {
  if (Logger.prototype.logData[chatId]) {
    var data = Logger.prototype.logData[chatId][Logger.prototype.logData[chatId].length - 1];
    return data ? { msg: data.msg, date: data.date, stamp: dateUtil.getDateAsString(data.date) } : -1;
  }
  return -1;
}

Logger.prototype.addLogToChat = function(chatId, data) {
  var cid = data.cid;
  var log = { userEmail: data.userEmail, msg: data.msg, date: data.date };
  Logger.prototype.checkLogMapFor(cid);
  Logger.prototype.logData[chatId].push(log);
  return log;
}

Logger.prototype.checkLogMapFor = function(chatId) {
  if (!Logger.prototype.logData[chatId]) {
    Logger.prototype.logData[chatId] = new Array();
  }
}

/**
 * @deprecated
 */
Logger.prototype.getLog = function(chatId, fromDB, userEmail) {
  if (!userEmail) return Logger.prototype.logData[chatId] === undefined ? -1 : Logger.prototype.logData[chatId];
  var logEntry = Logger.prototype.logData[chatId];
  var log = '';
  if (logEntry != null && logEntry !== undefined) {
    logEntry.forEach((item, i) => {
      isMyMsg = item.userEmail == userEmail;
      log += Logger.prototype.buildMessage(item, isMyMsg);
      // log += ;
    });
  }
  return log;
}

/**
 * @returns -
 */
Logger.prototype.getLatestMsg = function(cid, data) {
  var n = data.userEmail;
  var m = escapeUtil.escape(data.msg);
  var d = escapeUtil.escape(dateUtil.getDateAsString(data.date));
  var dat = {};
  dat["userEmail"] = n;
  // find target userEmail
  for (var target in Logger.prototype.chatListByUser[n]) {
    if (Logger.prototype.chatListByUser[n][target] == cid) {
      dat["target"] = target;
      break;
    }
  }
  dat["msg"] = m;
  dat["date"] = d;
  return dat;
}


/**
 * @returns an array containing myMsg in 0, notMyMsg in 1.
 */
Logger.prototype.buildMessage = function(data, isMyMsg) {
  // var dt = Logger.prototype.getSafeData(data.userEmail, data.msg, data.date);
  var n = data.userEmail;
  var m = escapeUtil.escape(data.msg);
  var d = escapeUtil.escape(dateUtil.getDateAsString(data.date));
  var built = '';
  built += isMyMsg ?
    `<div class="outgoing_msg"><div class="sent_msg">` :
    `<div class="incoming_msg"><div class="received_msg"><div class="received_withd_msg">`;
  built += `<p>`;
  built += m;
  built += `</p><span class="time_date">`;
  built += d;
  built += `</span></div></div>`;
  built += isMyMsg ? `` : `</div>`;
  return built;
}

Logger.prototype.buildChatList = function(userEmail, msg, date) {
  var built = '';
  var n = userEmail;
  var nn = Logger.prototype.nicknames[userEmail];
  console.log(Logger.prototype.nicknames);
  var m = msg ? escapeUtil.escape(msg) : '';
  var d = date ? escapeUtil.escape(dateUtil.getDateAsString(date)) : '';
  built += `<div id="`;
  built += n;
  built += `" class="chat_list" style="cursor: pointer;" onclick="loadChatBySelection(this)">`;
  built += `<div class="chat_people">`;
  built += `<div class="chat_img"> <img src="https://ptetutorials.com/images/user-profile.png" alt="sunil"> </div>`;
  built += `<div class="chat_ib"><h5>`;
  built += n + ` (` + nn + `)`;
  built += `<span class="chat_date">`;
  built += d ? d : ``;
  built += `</span></h5><p>`;
  built += m ? m : ``;
  built += `</p></div></div></div>`;
  return built;
}

/**
 * @WIP mustache template message
 */
Logger.prototype.builtTmplMessage = function(data, mine) {
  var item = {
    "msg": escapeUtil.escape(data.msg),
    "date": escapeUtil.escape(dateUtil.getDateAsString(data.date))
  }
  var template = mine ?
    `<div class="outgoing_msg"><div class="sent_msg">` :
    `<div class="incoming_msg"><div class="received_msg"><div class="received_withd_msg">`;
  template += `<p>{{item.msg}}</p><span class="time_date">{{item.date}}</span></div></div>`;
  if (!mine) template += `</div>`;
  return '';
}

module.exports = Logger;
