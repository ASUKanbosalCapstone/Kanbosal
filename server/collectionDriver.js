var ObjectID = require('mongodb').ObjectID;
var db;

CollectionDriver = function(datab) {
    db = datab;
};

/* Returns all documents in the collectionName in results. */
CollectionDriver.prototype.findAll = function(collectionName, callback) {
    db.collection(collectionName, function(error, collection) {
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

/* Returns the document with the provided id in collectionName to results. */
CollectionDriver.prototype.get = function(collectionName, id, callback) {
    db.collection(collectionName, function(error, collection) {
        if (error)
            callback(error);
        else {
            var checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$");

            if (!checkForHexRegExp.test(id))
                callback({error: "invalid id"});
            else {
                collection.findOne({'_id': ObjectID(id)}, function(error, results) {
                    if (error)
                        callback(error);
                    else
                        callback(null, results);
                });
            }
        }
    });
};

/* Returns the user document with the provided email. */
CollectionDriver.prototype.getEmail = function(email, callback) {
    db.collection("users").findOne({'email': email}, function(error, results) {
        if (error)
            callback(error);
        else
            callback(null, results);
    });
};

/* Returns users by their department*/
CollectionDriver.prototype.getUsersByDept = function(data, callback){
    db.collection("users").find(data).toArray(function (error, users) {
        if (error)
            callback(error);
        else
            callback(null, users);
    });
};

/* Returns the grants belonging to the user with userId. */
CollectionDriver.prototype.getGrants = function(userId, callback) {
    db.collection("users").findOne({'_id': ObjectID(userId)}, function(error, user) {
        if (error)
            callback(error);
        else {
            var grantIds = user.grantIds.map(function(grant) {
                return ObjectID(grant);
            });
            db.collection("grants").find({'_id': {'$in': grantIds}}).toArray(function(error, grants) {
                if (error)
                    callback(error);
                else
                    callback(null, grants);
            });
        }
    })
}

/* Returns a collection of cards matching the given grant ObjectID and userPermissionId. */
CollectionDriver.prototype.getCards = function(grantId, userPermissionId, callback) {
    db.collection("grants").findOne({'_id': ObjectID(grantId)}, function(error, grant) {
        if (grant) {
            var returnCards = {
                progress: 0,
                toDo: [],
                inProgress: [],
                complete: []
            };
            var cards = grant.stages[userPermissionId];
            returnCards.progress = cards.progress;
            var toDoIds = cards.toDo.map(function(item) {
                return ObjectID(item);
            });
            var inProgressIds = cards.inProgress.map(function(item) {
                return ObjectID(item);
            });
            var completeIds = cards.complete.map(function(item) {
                return ObjectID(item);
            });
            db.collection("cards").find({'_id': {'$in': toDoIds}}).toArray(function(error, cards) {
                if (error)
                    callback(error);
                else {
                    returnCards.toDo = cards;
                    db.collection("cards").find({'_id': {'$in': inProgressIds}}).toArray(function(error, cards) {
                        if (error)
                            callback(error);
                        else {
                            returnCards.inProgress = cards;
                            db.collection("cards").find({'_id': {'$in': completeIds}}).toArray(function(error, cards) {
                                if (error)
                                    callback(error);
                                else {
                                    returnCards.complete = cards;
                                    callback(null, returnCards);
                                }
                            });
                        }
                    });
                }
            });
        }
        else
            callback(error);
    });
}

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

    db.collection(collectionName, function(error, collection) {
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
CollectionDriver.prototype.update = function(collectionName, docUpdates, docId, userId, callback) {
    if (collectionName == "cards") {
        docUpdates.$addToSet = {userIds: userId};   // Adds the current user to the list of users in the card
        docUpdates.$currentDate = {timeLastEdit: true}  // Updates the timeLastEdit to the current time
    }

    db.collection(collectionName, function(error, collection) {
        if (error)
            callback(error);
        else {
            collection.updateOne(
                {'_id': ObjectID(docId)},
                docUpdates,
                function(error, results) {
                    if (error)
                        callback(error);
                    else
                        callback(null, results);
                }
            );
        }
    });
};

/* Moves cards through the columns of a single table of a grant */
CollectionDriver.prototype.moveCard = function(grantId, card, userPermissionId, callback) {
    var docUpdates = {
        $pull: {},
        $addToSet: {}
    };
    docUpdates.$pull['stages.' + userPermissionId + '.' + card.curCol] = card.id;
    docUpdates.$addToSet['stages.' + userPermissionId + '.' + card.newCol] = card.id;
    // callback(null, docUpdates);

    db.collection('grants', function(error, collection) {
        if (error)
            callback(error);
        else {
            collection.update({'_id': ObjectID(grantId)}, docUpdates, function(error, results) {
                if (error)
                    callback(error);
                else
                    callback(null, results);
            });
            // callback(null, true);
        }
    });
};

/* Deletes the doc with the given docId in collectionName */
CollectionDriver.prototype.delete = function(collectionName, docId, callback) {
    db.collection(collectionName, function(error, collection) {
        if (error)
            callback(error);
        else {
            collection.deleteOne({'_id': ObjectID(docId)}, function(error, doc) {
                if (error)
                    callback(error);
                //Remove the cardId from grants
                else if (collectionName == "cards") {
                    removeCardsFromGrant(docId, callback);
                }
                callback(null, doc);
            });
        }
    });
};

/* Removes the given cardId from all grants */
var removeCardsFromGrant = function(cardId, callback) {
    db.collection("grants", function(error, grants) {
        if (error)
            callback(error);
        else {
            grants.update({"stages.toDo": cardId}, {$pull: {"stages.$.toDo": cardId}}, {multi: true}, function(error, result) {
                if (error)
                    callback(error);
            });
            grants.update({"stages.inProgress": cardId}, {$pull: {"stages.$.inProgress": cardId}}, {multi: true}, function(error, result) {
                if (error)
                    callback(error);
            });
            grants.update({"stages.complete": cardId}, {$pull: {"stages.$.complete": cardId}}, {multi: true}, function(error, result) {
                if (error)
                    callback(error);
            });
        }
    });
}

exports.CollectionDriver = CollectionDriver;
