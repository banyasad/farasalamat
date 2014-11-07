var http = require('http');

AuthHandler = function(collectionDriver) {
    this.collectionDriver = collectionDriver;
};

AuthHandler.prototype.login = function(req, res) {
    var payload = JSON.stringify(req.body);
    var options = {
            host: 'farasalamat.ir',
            port: 7070,
            path: '/auth',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'Content-Length': payload.length
            }
    };

    var request = http.request(options, function(response) {
        response.setEncoding('utf8');
        response.on('data', function (doc) {
                res.send(response.statusCode, doc);
        });
    });

    request.on('error', function(error) {
        res.send(400, 'Could not connect to the server');
    });

    request.write(payload);
    request.end();
};

AuthHandler.prototype.getUser = function(req, res) {
    var user = req.params.doc;
    var collection = req.params.collection;
//console.log(user);
    var options = {
            host: 'farasalamat.ir',
            port: 7070,
            path: '/auth/' + collection + '/' + user,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'Content-Length': 0
            }
    };

    var request = http.request(options, function(response) {
        response.setEncoding('utf8');
        response.on('data', function (doc) {
                res.send(response.statusCode, doc);
        });
    });

    request.on('error', function(error) {
        res.send(400, 'Could not connect to the server');
    });

    request.write('');
    request.end();
};

exports.AuthHandler = AuthHandler;