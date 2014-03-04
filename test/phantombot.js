var page = require('webpage').create();

console.log('Starting the phantom bot');

page.open('http://weplay.io', function(status) {

  var doneWithForm = false;

  if (status != 'success') {
    console.log('Failed to load weplay.io with status: ' + status);
    phantom.exit();
  } else {
    console.log('Loaded weplay.io');
  }

  doneWithForm = page.evaluate(function() {
    var inputForm = document.getElementsByClassName('input')[0].children[0];
    var input = inputForm.children[0];
    input.value = "phantom bot";
    inputForm.submit();
    return true;
  });
  
  setInterval(function() {
    if (doneWithForm) {
      console.log('Exiting the phantom bot');
      phantom.exit();
    } else {
      console.log('still waiting on form');
    }
    
  }, 1000);
});