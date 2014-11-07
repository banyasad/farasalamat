var https = require('https');
var http = require('http');
var express = require('express');
var path = require('path');
var fs = require('fs');

var bodyParser = require('body-parser');

MongoClient = require('mongodb').MongoClient,
Server = require('mongodb').Server,
CollectionDriver = require('./collectionDriver').CollectionDriver;
Handler = require('./handler').Handler;

var options = {
  key: fs.readFileSync('keys/key.pem'),
  cert: fs.readFileSync('keys/cert.pem')
};

var app = express();
app.set('port', process.env.PORT || 8080);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

var mongoHost = 'localHost';
var mongoPort = 27017;
var collectionDriver;

mongoClient = new MongoClient(new Server(mongoHost, mongoPort));
mongoClient.open(function(err, mongoClient) {
  if (!mongoClient) {
      console.error("Error! Exiting... Must start MongoDB first");
      process.exit(1);
  }
  var db = mongoClient.db("farasalamat");
  var authdb = mongoClient.db("auth");

  collectionDriver = new CollectionDriver(db);
  
  handler = new Handler(db, authdb);

});

app.use(bodyParser());

function requireHTTPS(req, res, next) {
    if (!req.secure) {
        var tokens = req.get('host').split(':');
        var host = (tokens.length == 1 )? tokens[0] : tokens[0] + ':' + app.get('port');
        return res.redirect('https://' + host + req.url);
    }
    next();
};

app.use(requireHTTPS);

app.use(express.static(path.join(__dirname, 'public')));

app.get('/:server/:collection/:doc', function(req, res) {
    handler.get(req, res);
});

app.post('/:server/:collection', function(req, res) {
    handler.post(req, res);
});

app.put('/:collection/:entity', function(req, res) {
    var params = req.params;
    var entity = params.entity;
    var collection = params.collection;
    if (entity) {
       collectionDriver.update(collection, req.body, entity, function(error, objs) {
          if (error) { res.send(400, error); }
          else { res.send(200, objs); }
       });
   } else {
       var error = { "message" : "Cannot PUT a whole collection" };
       res.send(400, error);
   }
});

app.use(function (req,res) {
    res.render('404', {url:req.url});
});

https.createServer(options, app).listen(app.get('port'), function(){
  console.log('Https: Express server listening on port ' + app.get('port'));
});

http.createServer(app).listen(3000, function(){
  console.log('Http: Express server listening on port ' + 3000);
});

