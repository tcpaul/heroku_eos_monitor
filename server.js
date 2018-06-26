var express = require('express');
var request = require('request');
var app = express();

var bitspace_API = 'https://api.eos.bitspace.no/v1/chain/';

var first_run = true;
var last_block = null;

var _POST = function(URL, jsonData) {
  return new Promise(function(resolve, reject) {
    request.post(
      {
        url: URL,
        method: 'POST',
        json: jsonData
      },
      function(error, response, body) {
        if (!error) {
          resolve(body);
        } else {
          reject(error);
        }
      }
    );
  });
};

var blockchain_freeze = setInterval(function() {
  request(
    {
      url: bitspace_API + 'get_info',
      method: 'GET',
      timeout: 10000,
      followRedirect: true,
      maxRedirects: 10
    },
    function(error, response, body) {
      var block_header = body;
      if (!error && response.statusCode == 200) {
        if (last_block !== null && last_block !== block_header) {
          _POST(
            'https://hooks.slack.com/services/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',
            {
              text:
                '<@U4UBAG3R8><@U79G29C2E><@U9AS39B0W><@U81HXTGLT><@UAHQP260Z><@UAFV267K3>The blockchain is frozen on  https://api.eos.bitspace.no/v1/chain/. Cloud service @ https://eos-blockchain-monitor.herokuapp.com/'
            }
          );
        }
        if (first_run !== true) {
          async function checkProducer() {
            console.log('calling');
            var test = await _POST(bitspace_API + 'get_block', {
              block_num_or_id: 500
            });
            console.log('1.' + JSON.stringify(test.producer));
            console.log('done');

            console.log(block_header);
            console.log(JSON.parse(block_header).head_block_num);
            console.log(last_block);
            console.log(JSON.parse(last_block).head_block_num);
            var header_number = JSON.parse(block_header).head_block_num;
            for (
              var block_number = JSON.parse(last_block).head_block_num;
              block_number < header_number;
              block_number++
            ) {
              var currentBlockToCheck = await _POST(
                bitspace_API + 'get_block',
                {
                  block_num_or_id: block_number
                }
              );

              console.log(currentBlockToCheck.producer);
            }
            last_block = block_header;
            console.log('async done');
          }
          checkProducer();
          console.log('if done');
        } else {
          first_run = false;
          last_block = block_header;
        }
      } else {
        _POST(
          'https://hooks.slack.com/services/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',
          {
            text:
              'Our api is not responding. Cloud service @ https://api.eos.bitspace.no/v1/chain/   error:' +
              error
          }
        );
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
