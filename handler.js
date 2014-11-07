AuthHandler = require('./handlers/authHandler').AuthHandler;


Handler = function(db, authdb) {
    this.db = db;
    this.collectionDriver = new CollectionDriver(db);

    this.authdb = authdb;
    this.authCollectionDriver = new CollectionDriver(authdb);
    this.authHandler = new AuthHandler(this.authCollectionDriver);
};

Handler.prototype.get = function(req, res) {
    var server = req.params.server;
    var collection = req.params.collection;
    if (server == 'auth' && collection == 'users') {
        this.authHandler.getUser(req, res);
    } else {
        this.collectionDriver.get(req.params, function(error, objs) {
               if (error) { res.send(400, error); }
               else { 
                   res.set('Content-Type','application/json');
                   res.send(200, objs);
             }
       });
    }
};

Handler.prototype.post = function(req, res) {
    var object = req.body;
    var collection = req.params.collection;
    var collectionDriver = this.collectionDriver;
    if (collection == 'vault') {
        this.authHandler.login(req, res);
    } else {
        var pin = this.createRandomPin();
        object.pin = pin;
        collectionDriver.save(collection, object, function(err,docs) {
            if (err) { res.send(400, err); } 
            else { res.send(201, docs); }
        });
    }
};

Handler.prototype.createRandomPin = function() {
    return Math.floor(Math.random()*9000) + 1000;
};

exports.Handler = Handler;