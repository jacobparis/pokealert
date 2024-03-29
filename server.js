// DEPENDENCIES
// -----------------------------------------------------
var express         = require('express');
var https           = require('https');
var http            = require('http');
var mongoose        = require('mongoose');
var port            = process.env.PORT || 3000;
var morgan          = require('morgan');
var bodyParser      = require('body-parser');
var methodOverride  = require('method-override');
var fs              = require('fs');

var app             = express();

/* Note: using staging server url, remove .testing() for production
Using .testing() will overwrite the debug flag with true */
var LEX = require('letsencrypt-express').testing();

// Change these two lines!
var DOMAIN = 'pokealert.com';
var EMAIL = 'pokealert@jacobpariseau.com';

var lex = LEX.create({
  configDir: require('os').homedir() + '/letsencrypt/etc'
, approveRegistration: function (hostname, approve) { // leave `null` to disable automatic registration
    if (hostname === DOMAIN) { // Or check a database or list of allowed domains
      approve(null, {
        domains: [DOMAIN]
      , email: EMAIL
      , agreeTos: true
      });
    }
  }
});



// Express Configuration
// -----------------------------------------------------
// Sets the connection to MongoDB
mongoose.connect("mongodb://bellatrix:helenabonhamcarter@ec2-52-42-119-121.us-west-2.compute.amazonaws.com:27017/pokealert1");

// Logging and Parsing
app.use(express.static(__dirname + '/public'));                 // sets the static files location to public
app.use('/bower_components',  express.static(__dirname + '/bower_components')); // Use BowerComponents
app.use(morgan('dev'));                                         // log with Morgan
app.use(bodyParser.json());                                     // parse application/json
app.use(bodyParser.urlencoded({extended: true}));               // parse application/x-www-form-urlencoded
app.use(bodyParser.text());                                     // allows bodyParser to look at raw text
app.use(bodyParser.json({ type: 'application/vnd.api+json'}));  // parse application/vnd.api+json as json
app.use(methodOverride());

// Routes
// ------------------------------------------------------
require('./app/routes.js')(app);

// Listen
// -------------------------------------------------------
//http.createServer(app).listen(port);
//https.createServer(options, app).listen(port+1);
//console.log('App listening on port ' + port);

http.createServer(LEX.createAcmeResponder(lex, function redirectHttps(req, res) {
    res.setHeader('Location', 'https://' + req.headers.host + req.url);
    res.statusCode = 302;
    res.end('<!-- Hello Developer Person! Please use HTTPS instead -->');
  })).listen(3000);

  app.use('/', function (req, res) {
     res.end('Hello!');
   });

  https.createServer(lex.httpsOptions, LEX.createAcmeResponder(lex, app)).listen(4430);
