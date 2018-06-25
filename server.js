var express = require('express');
var request = require('request');
var app = express();

var base_URL = 'https://api.eos.bitspace.no/v1/chain/';

var last_block = null;

var _POST = function(URL, jsonData) {
  request.post(
    {
      url: URL,
      method: 'POST',
      json: jsonData
    },
    function(error, response, body) {
      if (!error) {
        console.log(body);
      } else {
        console.log(error);
      }
    }
  );
};

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
      var block_header = body;
      if (!error && response.statusCode == 200) {
        if (last_block !== null && last_block === block_header) {
          console.log('blockchain is frozen! ' + body);
          _POST(
            'https://hooks.slack.com/services/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',
            { text: 'it works!' }
          );
        }
      } else {
        console.log('error' + response.statusCode);
      }
      last_block = block_header;
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
