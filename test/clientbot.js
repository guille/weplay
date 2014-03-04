var io = require('socket.io-client');
var crypto = require('crypto');

var socket = io('http://weplay.io');

var done = false;

setInterval(function() {
    if (done) {
      console.log('Ending the bot');
      process.exit(0);
    } else {
      console.log('still waiting to send em all');
    }
  }, 5000);

socket.on('connect', function() {
  console.log('connected!');
  joinRoom();
  doRandomMoves();
});

function joinRoom() {
  var botName = 'phantom-bot-' + randomString(6);
  console.log('joining as ' + botName);
  socket.emit('join', botName);
}

function doRandomMoves() {
  // time to do some random actions
  var i = 0;
  var timer = setInterval(function() {
    var validMoves = [
      'left',
      'right',
      'up',
      'down',
      'a',
      'b',
      'select',
      'start'
    ];
    var idx = Math.floor(Math.random() * validMoves.length);
    var move = validMoves[idx];
    socket.emit('move', move);
    console.log('made this move: ' + move);
    socket.emit('message', randomString(10));

    if (++i >= 20) {
      clearInterval(timer);
      done = true;
    }
  }, 510);
}

function randomString(bytes) {
  return crypto.randomBytes(bytes).toString('base64');
}