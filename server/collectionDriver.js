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
        else if (collectionName === 'grants')
            collection.find({}, {sort: 'title'}).toArray(function(error, results) {
                if (error) callback(error);
                else callback(null, results);
            });
        else
            collection.find().toArray(function(error, results) {
                if (error) callback(error);
                else callback(null, results);
            });
    });
};

/* Returns all documents in the collectionName in results. */
CollectionDriver.prototype.findSome = function(collectionName, query, callback) {
    db.collection(collectionName, function(error, collection) {
        if (query.hasOwnProperty('permissions.stage'))  // uri only reads string values
            query['permissions.stage'] = parseInt(query['permissions.stage'], 10);

        if (error) callback(error);
        else if (query.hasOwnProperty('email'))     // unique queries, add 'or' op if needed
            collection.findOne(query, function (error, results) {
                if (error) callback(error);
                else callback(null, results);
            });
        else if (collectionName === 'users')        // sort users by name
            collection.find(query, { sort: 'name' }).toArray(function(error, results) {
                if (error) callback(error);
                else callback(null, results);
            });
        else                                        // query for sets
            collection.find(query).toArray(function(error, results) {
                if (error) callback(error);
                else callback(null, results);
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
    });
};

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
            returnCards.grantTitle = grant.title;
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
};

/* Inserts the doc in the collection with collectionName. */
CollectionDriver.prototype.save = function(collectionName, doc, userId, callback) {
    if (collectionName == "cards") {
        doc.timeCreated = new Date();
        doc.timeLastEdit = new Date();
    }
    else if (collectionName == "grants") {
        doc.users.push(userId);
    }

    db.collection(collectionName, function(error, collection) {
        if (error)
            callback(error);
        else {
            collection.insertOne(doc, function() {
                callback(null, doc);
            });
        }
    });
};

/* Updates the found queryObject in collectionName with updateObject */
var mongoUpdate = function(collectionName, queryObj, updateObj, callback) {
    db.collection(collectionName, function(error, collection) {
        if (error)
            callback(error);
        else {
            collection.update(queryObj, updateObj, function(error, results) {
                if (error)
                    callback(error);
                else
                    callback(null, results);
            });
        }
    });
};

/* Updates the doc with the given docId in collectionName */
CollectionDriver.prototype.update = function(collectionName, updateObj, docId, userId, callback) {
    var queryObj = {_id: ObjectID(docId)};
    if (collectionName == "cards") {
        if (updateObj.$addToSet) {
            updateObj.$addToSet.userIds = userId;
            updateObj.$currentDate = {timeLastEdit: true}
        }
        else {
            updateObj.$addToSet = {userIds: userId};   // Adds the current user to the list of users in the card
            updateObj.$currentDate = {timeLastEdit: true}  // Updates the timeLastEdit to the current time
        }
    }

    mongoUpdate(collectionName, queryObj, updateObj, callback);
};

/* Moves cards through the columns of a single table of a grant */
CollectionDriver.prototype.moveCard = function(grantId, card, callback) {
    var queryObj = {_id: ObjectID(grantId)};
    var updateObj = {
        $pull: {},
        $addToSet: {}
    };
    updateObj.$pull['stages.' + card.curStage + '.' + card.curCol] = card.id;
    updateObj.$addToSet['stages.' + card.newStage + '.' + card.newCol] = card.id;

    mongoUpdate("grants", queryObj, updateObj, callback);
};

CollectionDriver.prototype.moveCardStage = function(grantId, card, back, callback) {
    var grantQueryObj = {_id: ObjectID(grantId)};
    var cardQueryObj = {_id: ObjectID(card.id)};
    var grantUpdateObj;
    var cardUpdateObj = {
        $set: {}
    };

    if (back) {
        grantUpdateObj = {
            $pull: {},
            $addToSet: {}
        };
        grantUpdateObj.$pull['stages.' + card.curStage + '.' + card.curCol] = card.id;
        grantUpdateObj.$addToSet['stages.' + card.newStage + '.' + card.newCol] = card.id;

        cardUpdateObj.$set['lock.' + card.newStage] = false;
    }
    else {
        grantUpdateObj = {
            $addToSet: {}
        };
        grantUpdateObj.$addToSet['stages.' + card.newStage + '.' + card.newCol] = card.id;

        cardUpdateObj.$set['lock.' + card.curStage] = true;
    }

    // Update grant
    mongoUpdate("grants", grantQueryObj, grantUpdateObj, function(error, results) {
        if (error)
            callback(error);
    });

    // Update card lock
    mongoUpdate("cards", cardQueryObj, cardUpdateObj, function(error, results) {
        if (error)
            callback(error);
        else
            callback(null, results);
    });
};

/* Deletes the doc with the given docId in collectionName */
CollectionDriver.prototype.delete = function(collectionName, docId, callback) {
    db.collection(collectionName, function(error, collection) {
        if (error)
            callback(error);
        else {
            if (collectionName == "grants") {
                collection.findOne({_id: ObjectID(docId)}, function(error, doc) {
                    if (error)
                        callback(error);
                    else {
                        removeGrantFromUsers(docId, callback);
                        var cardsToDelete = buildCardIdsToDelete(doc);
                        deleteCards(cardsToDelete);

                        collection.removeOne({_id: ObjectID(docId)}, function(error, doc) {
                            if (error)
                                callback(error);
                            else
                                callback(null, doc);
                        });
                    }
                });
            }
            else {
                collection.deleteOne({'_id': ObjectID(docId)}, function(error, doc) {
                    if (error)
                        callback(error);
                    else if (collectionName == "cards") {
                        removeCardFromGrant(docId, callback);
                    }
                    callback(null, doc);
                });
            }
        }
    });
};

/* Removes the given cardId from all grants */
var removeCardFromGrant = function(cardId, callback) {
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
};

/* Removes the grantId from the user object */
var removeGrantFromUsers = function(grantId, callback) {
    db.collection("users", function(error, users) {
        if (error)
            callback(error);
        else {
            users.update({}, {$pull: {grantIds: grantId}}, {multi: true}, function(error, result) {
                if (error)
                    callback(error);
            });
        }
    });
};

/* Assembles the card ids to delete in an array */
var buildCardIdsToDelete = function(grant, callback) {
    var idArray = [];
    for (var i = 0; i < grant.stages.length; i++) {
        if (i == grant.stages.length - 1) {
            var cards = grant.stages[i];
            var cardIds = cards.cards.map(function(item) {
                return ObjectID(item);
            });
            idArray = idArray.concat(cardIds);
        }
        else {
            var cards = grant.stages[i];
            var toDoIds = cards.toDo.map(function(item) {
                return ObjectID(item);
            });
            var inProgressIds = cards.inProgress.map(function(item) {
                return ObjectID(item);
            });
            var completeIds = cards.complete.map(function(item) {
                return ObjectID(item);
            });
            idArray = idArray.concat(toDoIds);
            idArray = idArray.concat(inProgressIds);
            idArray = idArray.concat(completeIds);
        }
    }
    return idArray;
}

/* Deletes the cards in the given cardIds array */
var deleteCards = function(cardIds, callback) {
    db.collection("cards", function(error, cards) {
        if (error)
            callback(error);
        else {
            cards.deleteMany({_id: {$in: cardIds}}, function(error, result) {
                if (error)
                    callback(error);
            });
        }
    });
}

exports.CollectionDriver = CollectionDriver;
