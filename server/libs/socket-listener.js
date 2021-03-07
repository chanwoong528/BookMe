// Chat server
var Chat = require('../models/Chat');
var User = require('../models/User');
var Logger = require('./Logger');
var logger = new Logger();
var socketio = require('socket.io');
var kg = require('../libs/keygen');

var online_users = {}; // {userEmail:{socket.id: chatId}} // user with socket.id currently in 'chatId' room
var passKey = {}; // {userEmail:key} // user's current passKey
var chatRef = {}; // {userEmail:{index:chatId,}}

var notify = {}; // {userEmail:boolean}

module.exports.newPassKey = function(userEmail) {
  var key = kg.generateKey() || ' %%% this is a temporary key for ' + userEmail;
  passKey[userEmail] = key;
  console.log(' **** passKey for [' + userEmail + ']: ' + passKey[userEmail]);
  return key;
}

module.exports.getPassKey = function(userEmail) {
  if (!passKey[userEmail]) addPassKey(userEmail);
  return passKey[userEmail];
}

function check_key(v, m) {
  var val = '';
  for (var key in m) {
    if (m[key] == v)
      val = key;
  }
  return val;
}

logger.init();

module.exports.listen = function(server) {
  io = socketio.listen(server);

  io.on('connection', function(socket) {
    socket.on('notification init', function(userEmail) {
      if (userEmail) {
        addSocketInfo(socket, 'notification', userEmail);
        checkNotification(socket);
      } else { // if no userEmail
        socket.disconnect(true);
      }
    });

    socket.on('chat init', async function(userEmail, target, pk) {
      if (!userEmail || !pk || !target || !passKey[userEmail] || passKey[userEmail] != pk) {
        console.log('cinit, userEmail: ' + userEmail + '\npk | passKey[userEmail]: ' + pk + ' | ' + passKey[userEmail]);
        socket.emit('redirect');
        socket.disconnect(true);
      } else { // params are valid
        var chatId = await logger.getChatId(userEmail, target);
        if (chatId == '') { // no chatId, could be invalid approach
          socket.emit('redirect');
          socket.disconnect(true);
        } else { // found chatId, add socket info
          socket.emit('chat init');
          addSocketInfo(socket, chatId, userEmail, target);

          var recentLog = logger.getRecentLog(chatId, userEmail, target, 30);
          recentLog != -1 ? socket.emit('load log', { recentLog }) : console.log('No recent log for ' + chatId);
        }
      }
    });

    socket.on('request chat list', function(userEmail, pk) {
      if (!passKey[socket.userEmail] || !pk || passKey[socket.userEmail] != pk) {
        // invalid approach, disconnect
        console.log('rcl, userEmail: ' + socket.userEmail + '\npk | passKey[socket.userEmail]: ' + pk + ' | ' + passKey[socket.userEmail]);

        socket.emit('redirect');
        socket.disconnect(true);
      } else {
        var list = logger.getChatList(userEmail);
        socket.emit('receive chat list', { list });
      }

    });

    socket.on('send message', function(data, pk) {
      // data validation
      if (!passKey[socket.userEmail] || !pk || passKey[socket.userEmail] != pk) {
        // invalid approach, disconnect
        console.log('sm, userEmail: ' + socket.userEmail + '\npk | passKey[socket.userEmail]: ' + pk + ' | ' + passKey[socket.userEmail]);

        socket.emit('redirect');
        socket.disconnect(true);
      } else {
        // set data's date-time to current time
        data.date = Date.now();

        var cid = online_users[socket.userEmail][socket.id];
        console.log('cid?? ' + cid);

        // add data to log
        var retLog = logger.addLogToChat(cid, data);
        if (retLog) { // if successful
          // for & send messages as html tags
          myMsg = logger.buildMessage(data, true);
          socket.emit('receive msg', myMsg);

          // let others in chatroom be notified
          notifyAll(cid, data.userEmail);

          yourMsg = logger.buildMessage(data, false);
          socket.to(cid).emit('receive msg', yourMsg);

          // update the chat list for clients
          updateChatList(socket, cid, data);

        } else { // if unsuccessful, receive error message
          socket.emit('error message');
        }
      }

    });

    socket.on('clear notification', function() {
      notify[socket.userEmail] = false;
    });

    socket.on('disconnect', function() {
      var chatId = removeSocketInfo(socket);
      console.log('[' + socket.userEmail + '] disconnected from ' + chatId + '.');

      // var chatId = logger.getChatId(socket.id);
      // io.in(chatId).emit('system message', 'SYSTEM: A user disconnected.');
      // var localLog = logger.socketIdExpired(socket.id);
      // console.log(' log socket EXPIRED, returned local log: ' + localLog);
    });

    socket.on('end chat', function(chatId) {
      console.log(' flushing ', chatId);
      // close room, flush logger's log, and send it to DB.
    });
  });

  function addSocketInfo(socket, chatId, userEmail, target) {
    // console.log('addSocketInfo triggered');
    socket.userEmail = userEmail;
    var item = {};
    item[socket.id] = chatId;
    if (online_users[userEmail]) {
      for (var sid in online_users[userEmail]) {
        // leave current room
        var cid = online_users[userEmail][sid];
        socket.leave(cid);
      }
    }
    online_users[userEmail] = item;
    socket.join(chatId);
  }

  /**
   * @returns {string} chatId
   */
  function removeSocketInfo(socket) {
    // remove entry from online_users
    var userEmail = socket.userEmail;
    var sid = socket.id;
    var chatId = '';
    if (userEmail) {
      if (online_users[userEmail]){
        chatId = online_users[userEmail][sid];
        delete online_users[userEmail];
      }
    }
    return chatId;
  }

  async function updateChatList(socket, cid, data){
    updated = logger.getLatestMsg(cid, data);
    console.log(' updated msg: ');
    console.log(updated);
    socket.emit('update chat list', updated.target, updated.msg, updated.date);
    socket.to(cid).emit('update chat list', updated.userEmail, updated.msg, updated.date);
  }

  function notifyAll (chatId, userEmail){
    var members = logger.getChatMembers(chatId,userEmail);
    if (members){
      members.forEach((member, i) => {
        if (member != userEmail){
          var sid = check_key('notification', online_users[member]);
          notify[member] = true;
          if (sid != '') io.to(sid).emit('receive notification');
        }
      });

    }
  }

  function checkNotification(socket) {
    var state = notify[socket.userEmail];
    console.log('[' + socket.userEmail + ']' + '\'s notification, status : ' + state);
    if (state === true) {
      // console.log('should receive notification');
      socket.emit('receive notification');
    } else if (state === undefined) {
      // create one with false
      notify[socket.userEmail] = false;
    } // ignore when false
  }
}
