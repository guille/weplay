console.log('Starting the phantom bot');

var page = require('webpage').create();
page.settings.userName = 'a';
page.settings.password = 'b';

page.open('http://wechat.io', function(status) {

  var done = false;

  if (status != 'success') {
    console.log('Failed to load weplay.io with status: ' + status);
    phantom.exit();
  } else {
    console.log('Loaded weplay.io');
  }

  /* want to log everything from browser console here */
  page.onConsoleMessage = function(msg){
    console.log(msg);
  };

  page.evaluate(function() {
    console.log('socket: ' + socket);

    var botName = 'phantom-bot-' + Math.floor(Math.random() * 10000);
    console.log('joining as ' + botName);
    socket.emit('join', botName);
    socket.nick = botName;
  });

  pressRandomButtons();

  function pressRandomButtons() {
    // time to press some random actions
    var i = 0;
    var timer = setInterval(function() {
      page.evaluate(function() {
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
        console.log('sent an event ' + move);
        socket.emit('message', 'a cool chat');
      });

      if (++i >= 20) {
        clearInterval(timer);
        done = true;
      }
    }, 510);
  }
  
  setInterval(function() {
    if (done) {
      console.log('Exiting the phantom bot');
      phantom.exit();
    } else {
      console.log('still waiting to send em all');
    }
  }, 5000);
});
