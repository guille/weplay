console.log('Starting the phantom bot');

var page = require('webpage').create();
page.settings.userName = 'a';
page.settings.password = 'b';

page.open('http://weplay.io', function(status) {

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

  /* get chat length before joining */
  var initialChatLength = page.evaluate(function() {
    return $('.messages').html().length;
  });

  console.log('initialChatLength: ' + initialChatLength);

  

  /* wait for join response from server -- had to add this because it doesn't
     always work the first time? */
  var chatLength;
  var timer = setInterval(function() {
    /* join the room */
    page.evaluate(function() {
      console.log('body class: ' + document.body.className);
      var inputForm = $('.input form');
      var input = $('.input form input');

      var botName = 'phantom-bot-' + Math.floor(Math.random() * 1000);
      input.val(botName);
      console.log('joining as ' + input.val());
      inputForm.submit();
    });

    chatLength = page.evaluate(function() {
      var chatLength = $('.messages').html().length;
      return chatLength;
    });

    if ((chatLength - initialChatLength) > 0) {
      clearInterval(timer);
      console.log('joined the room');
      pressRandomButtons();
    }
  }, 1000);

  function pressRandomButtons() {
    var validButtons = [
      page.event.key.A,
      page.event.key.S,
      page.event.key.Return,
      page.event.key.O,
      page.event.key.Left,
      page.event.key.Right,
      page.event.key.Up,
      page.event.key.Down
    ];

    /* time to press some random actions */
    var i = 0;
    var timer = setInterval(function() {
      /* give focus to window */
      page.evaluate(function() {
        $(window).focus();
      });

      var idx = Math.floor(Math.random() * validButtons.length);
      var key = validButtons[idx];
      page.sendEvent('keydown', key);
      console.log('sent an event!!');

      if (++i >= 20) {
        clearInterval(timer);
        done = true;
      }
    }, 2500);
  }
  
  setInterval(function() {
    if (done) {
      console.log('Exiting the phantom bot');
      phantom.exit();
    } else {
      console.log('still waiting to send em all');
    }
  }, 10000);
});