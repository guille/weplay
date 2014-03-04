var io = require('socket.io-client');
var crypto = require('crypto');

var socket = io('http://weplay.io');

var moves = 20;
if (process.argv.length >= 3) {
  moves = parseInt(process.argv[2]);
}

var connectedTime = 30000;
if (process.argv.length >= 4) {
  connectedTime = parseInt(process.argv[3]);
}

console.log('doing ' + moves + ' moves, connecting for ' + connectedTime + ' ms.');

var totalFrameBandwith = 0;
var totalChatChars = 0;

socket.on('connect', function() {
  console.log('connected!');
  joinRoom();

  setTimeout(function() {
    console.log('Number of characters received in chat: ' + totalChatChars);
    console.log('Size of all frames received in bytes: ' + totalFrameBandwith);
    console.log('Exiting the bot');
    process.exit(0);
  }, connectedTime);
});

socket.on('joined', function() {
  console.log('joined room!');
  doRandomMoves();
});

socket.on('frame', function(data) {
  totalFrameBandwith += data.length;
});

socket.on('message', function(msg, by) {
  totalChatChars += msg.length;
  totalChatChars += by.length;
});

socket.on('move', function(move, by) {
  totalChatChars += move.length;
  totalChatChars += by.length;
});

socket.on('join', function(nick, loc) {
  totalChatChars += nick.length;
  if (loc) {
    totalChatChars += loc.length;
  }
});

socket.on('disconnect', function(reason){
  console.log('disconnected?!? with reason: ' + reason);
});

function joinRoom() {
  var botName = 'phantom-bot-' + randomString(6);
  console.log('joining as ' + botName);
  socket.emit('join', botName);
}

function doRandomMoves() {
  // time to do some random actions
  console.log('making moves and chatting!');
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
    socket.emit('message', randomString(10));

    if (++i >= moves) {
      clearInterval(timer);
      console.log('done with moves and chat!');
    }
  }, 510);
}

function randomString(bytes) {
  return crypto.randomBytes(bytes).toString('base64');
}
