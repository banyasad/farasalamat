var ObjectID = require('mongodb').ObjectID;

CollectionDriver = function(db) {
  this.db = db;
};

CollectionDriver.prototype.getCollection = function(collectionName, callback) {
  this.db.collection(collectionName, function(error, the_collection) {
    if( error ) callback(error);
    else callback(null, the_collection);
  });
};

CollectionDriver.prototype.findAll = function(collectionName, callback) {
    this.getCollection(collectionName, function(error, the_collection) {
      if( error ) callback(error);
      else {
        the_collection.find().toArray(function(error, results) {
          if( error ) callback(error);
          else callback(null, results);
        });
      }
    });
};

CollectionDriver.prototype.get = function(params, callback) {
var collectionName = params.collection;
var patientId = params.doc;
    this.getCollection(collectionName, function(error, the_collection) {
        if (error) callback(error);
        else {
            the_collection.find({'patientId': patientId}).toArray(function(error,doc) {
                if (error) callback(error);
                else callback(null, doc);
            });
        }
    });
};

//save new object
CollectionDriver.prototype.save = function(collectionName, obj, callback) {
    this.getCollection(collectionName, function(error, the_collection) {
        if (error) callback(error);
        else {
            obj.created_at = new Date();
            the_collection.insert(obj, function() {
              callback(null, obj);
            });
          }
        });
    };

//update a specific object
CollectionDriver.prototype.update = function(collectionName, obj, entityId, callback) {
    this.getCollection(collectionName, function(error, the_collection) {
        if (error) callback(error);
        else {
            obj._id = ObjectID(entityId);
            obj.updated_at = new Date();
            the_collection.save(obj, function(error,doc) {
                if (error) callback(error);
                else callback(null, obj);
            });
        }
    });
};

exports.CollectionDriver = CollectionDriver;