// Probably going away in favor of newer methods.

CollectionDriver = function(db) {
    this.db = db;
};

CollectionDriver.prototype.getCollection = function(collectionName, callback) {
    this.db.collection(collectionName, function(error, the_collection) {
        if (error)
            callback(error);
        else
            callback(null, the_collection);
    });
};

CollectionDriver.findAll = function(collectionName, callback) {
    this.getCollection(collectionName, function(error, the_collection) {
        if (error)
            callback(error);
        else {
            the_collection.find().toArray(function(error, results) {
                if (error)
                    callback(error);
                else
                    callback(null, results);
            });
        }
    });
};

CollectionDriver.prototype.get = function(collectionName, id, callback) {
    this.getCollection(collectionName, function(error, the_collection) {
        if (error)
            callback(error);
        else {
            var checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$");

            if (!checkForHexRegExp.test(id))
                callback({error: "invalid id"});
            else
                the_collection.findOne({'_id':ObjectID(id)}, function(error,doc) {
                    if (error)
                        callback(error);
                    else
                        callback(null, doc);
                });
        }
    });
};

exports.CollectionDriver = CollectionDriver;
