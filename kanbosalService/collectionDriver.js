var ObjectID = require('mongodb').ObjectID;

CollectionDriver = function(db) {
    this.db = db;
};

/* Returns the given collection belonging to collectionName in the_collection. */
CollectionDriver.prototype.getCollection = function(collectionName, callback) {
    this.db.collection(collectionName, function(error, collection) {
        if (error)
            callback(error);
        else
            callback(null, collection);
    });
};

/* Returns all documents in the collectionName in results. */
CollectionDriver.prototype.findAll = function(collectionName, callback) {
    this.getCollection(collectionName, function(error, collection) {
        if (error)
            callback(error);
        else
            collection.find().toArray(function(error, results) {
                if (error)
                    callback(error);
                else
                    callback(null, results);
            });
    });
};

/* Returns the documents with the provided id in collectionName to results. */
CollectionDriver.prototype.get = function(collectionName, id, callback) {
    this.getCollection(collectionName, function(error, collection) {
        if (error)
            callback(error);
        else {
            var checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$");

            if (!checkForHexRegExp.test(id))
                callback({error: "invalid id"});
            else
                collection.findOne({'_id':ObjectID(id)}, function(error, results) {
                    if (error)
                        callback(error);
                    else
                        callback(null, results);
                });
        }
    });
};

/* Inserts the doc in the collection with collectionName. */
CollectionDriver.prototype.save = function(collectionName, doc, callback) {
    // ensure correct format for collection entry
    if (collectionName == "cards") {
        doc.timeCreated = new Date();
        doc.timeLastEdit = new Date();

        // ensureCardFormat(doc, function(error) {
        //     callback({error: "invalid card format: " + error});
        // });
    }
    else if (collectionName == "grants") {
        // ensureGrantFormat(doc, function(error) {
        //     callback({error: "invalid grant format: " + error});
        // });
    }
    else if (collectionName == "users") {
        // ensureUserFormat(doc, function(error) {
        //     callback({error: "invalid user format: " + error});
        // });
    }
    else {
        callback({error: "invalid collection"});
    }

    this.getCollection(collectionName, function(error, collection) {
        if (error)
            callback(error);
        else {
            // doc.created_at = new Date();
            collection.insertOne(doc, function() {
                callback(null, doc);
            });
        }
    });
};

/* Updates the doc with the given docId in collectionName. */
CollectionDriver.prototype.update = function(collectionName, docUpdates, docId, callback) {
    var updateObject;

    if (collectionName == "cards") {
        updateObject = {
            $set: docUpdates,
            $currentDate: {'timeLastEdit': true}    // updates timeLastEdit with current time
        };
    }
    else {
        updateObject = {
            $set: docUpdates
        };
    }

    this.getCollection(collectionName, function(error, collection) {
        if (error)
            callback(error);
        else {
            collection.updateOne(
                {'_id': ObjectID(docId)},
                updateObject,
                function(error, docUpdates) {
                    if (error)
                        callback(error);
                    else
                        callback(null, docUpdates);
                }
            );
        }
    });
};

/* Deletes the doc with the given docId in collectionName */
CollectionDriver.prototype.delete = function(collectionName, docId, callback) {
    this.getCollection(collectionName, function(error, collection) {
        if (error)
            callback(error);
        else {
            collection.deleteOne({'_id': ObjectID(docId)}, function(error, doc) {
                if (error)
                    callback(error);
                else
                    callback(null, doc);
            });
        }
    });
};

exports.CollectionDriver = CollectionDriver;
