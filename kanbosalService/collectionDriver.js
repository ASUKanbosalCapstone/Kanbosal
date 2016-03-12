var ObjectID = require('mongodb').ObjectID;


/* Ensures the card is of a certain format otherwise throws an error. */
var ensureCardFormat = function(doc, errorCallback) {
    if (!doc.title instanceof String)
        errorCallback(new Error("title must be a string."));
    doc.notes.forEach(function(note) {
        if (!note instanceof String)
            errorCallback(new Error("notes must be strings."));
    });
    if (!doc.documentUrl instanceof String)
        errorCallback(new Error("documentUrl must be a string."));
    if (!doc.timeCreated instanceof Object)
        errorCallback(new Error("timeCreated must be an object of Date."));
    if (!doc.timeLastEdit instanceof Object)
        errorCallback(new Error("timeLastEdit must be an object of Date."));
    if (!doc.status instanceof String)
        errorCallback(new Error("status must be a string."));
    doc.tags.forEach(function(tag) {
        if (!tag instanceof String)
            errorCallback(new Error("tags must be strings."));
    });
    doc.userIds.forEach(function(userId) {
        if (!userId instanceof String)
            errorCallback(new Error("userIds must be ObjectIDs."));
    });
    doc.lock.forEach(function(l) {
        if (!l instanceof Boolean)
            errorCallback(new Error("locks must be booleans."));
    })
}

CollectionDriver = function(db) {
    this.db = db;
};

/* Returns the given collection belonging to collectionName in the_collection. */
CollectionDriver.prototype.getCollection = function(collectionName, callback) {
    this.db.collection(collectionName, function(error, the_collection) {
        if (error)
            callback(error);
        else
            callback(null, the_collection);
    });
};

/* Returns all documents in the collectionName in results. */
CollectionDriver.prototype.findAll = function(collectionName, callback) {
    this.getCollection(collectionName, function(error, the_collection) {
        if (error)
            callback(error);
        else
            the_collection.find().toArray(function(error, results) {
                if (error)
                    callback(error);
                else
                    callback(null, results);
            });
    });
};

/* Returns the documents with the provided id in collectionName to results. */
CollectionDriver.prototype.get = function(collectionName, id, callback) {
    this.getCollection(collectionName, function(error, the_collection) {
        if (error)
            callback(error);
        else {
            var checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$");

            if (!checkForHexRegExp.test(id))
                callback({error: "invalid id"});
            else
                the_collection.findOne({'_id':ObjectID(id)}, function(error, results) {
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

    this.getCollection(collectionName, function(error, the_collection) {
        if (error)
            callback(error);
        else {
            // doc.created_at = new Date();
            the_collection.insert(doc, function() {
                callback(null, doc);
            });
        }
    });
};

exports.CollectionDriver = CollectionDriver;
