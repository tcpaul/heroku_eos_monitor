var express = require('express');
var request = require('request');
var app = express();

var base_URL = 'https://api.eos.bitspace.no/v1/chain/';

var blockchain_freeze = setInterval(function() {
  request(
    {
      url: base_URL + 'get_info',
      method: 'GET',
      timeout: 10000,
      followRedirect: true,
      maxRedirects: 10
    },
    function(error, response, body) {
      if (!error && response.statusCode == 200) {
        console.log('success!' + body);
      } else {
        console.log('error' + response.statusCode);
      }
    }
  );
}, 60000);

// set the port of our application
// process.env.PORT lets the port be set by Heroku
var port = process.env.PORT || 8080;

// set the view engine to ejs
app.set('view engine', 'ejs');

// make express look in the public directory for assets (css/js/img)
app.use(express.static(__dirname + '/public'));

// set the home page route
app.get('/', function(req, res) {
  // ejs render automatically looks in the views folder
  res.render('index');
});

app.listen(port, function() {
  console.log('Our app is running on http://localhost:' + port);
});
