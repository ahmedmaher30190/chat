'use strict';
/**
 * INIT VARIABLES
 */
var express = require('express');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var firebase = require('firebase');
var _ = require('lodash');

/**
 * FIREBASE CONFIG
 */
var config = {
  apiKey: 'AIzaSyASUEwwyQ7LC4rwR7dZ_0uoHppKH44wLYc',
  authDomain: 'vue-db.firebaseapp.com',
  databaseURL: 'https://vue-db.firebaseio.com',
  storageBucket: 'vue-db.appspot.com',
  messagingSenderId: '924165386185'
};

/**
 * FIREBASE INIT
 */
firebase.initializeApp(config);
var messagesDbRef = firebase.database().ref('chat/messages/');

/**
 * ANONYMOUS USER
 */
firebase.auth().signInAnonymously().catch(function(error) {
  console.log(error);
});

firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    console.log('user login');
  } else {
    console.log('user not found');
  }
});

/**
 * EXPRESS SETUP
 */
app.set('port', (process.env.PORT || 3000));
app.use('/npm', express.static('node_modules'));
app.use(express.static('app'));

app.get('/', function(req, res) {
  res.sendfile('./app/index.html');
});

/**
 * SOCKET LISTEN EVENT
 */
io.on('connection', function(socket) {

  console.log('user connected:', socket.id);

  io.emit('clean-chat');
  loadMessageFromDb(2);

  socket.broadcast.emit('user-connected', socket.id);

  socket.on('send-message', function(msg) {
    saveMessageToDb(socket.id, msg);
    io.emit('read-message', { msg: msg, userId: socket.id, time: new Date().getTime() });
  });
});

/**
 * CREATE SERVER
 */
http.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

function loadMessageFromDb(limit) {
  messagesDbRef.orderByChild('time').limitToLast(limit).once('value', function(snapshot) {
    var data = snapshot.val();
    _.forEach(data, function(data) {
      io.emit('read-message', { msg: data.message, userId: data.userId, time: data.time });
    });
  });
}

function saveMessageToDb(userId, message) {
  firebase.database().ref('/chat/messages/').push({
    userId: userId,
    message: message,
    time: new Date().getTime()
  });
}
