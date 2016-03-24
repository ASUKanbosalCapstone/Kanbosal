// Requirements
var http = require('http');
var express = require('express');
var path = require('path');
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var CollectionDriver = require('./collectionDriver').CollectionDriver;
var bodyParser = require('body-parser');

// Express settings
var app = express();
app.set('port', process.env.PORT || 3000);

// Mongo settings
var mongoHost = '127.0.0.1';
var mongoPort = 27017;
var mongoDatabase = 'kanbosal';
var url = 'mongodb://' + mongoHost + ':' + mongoPort + '/' + mongoDatabase;

var collectionDriver;

/* Connects to our mongo database running at url. */
MongoClient.connect(url, function(error, db) {
      assert.equal(null, error);
      console.log("Connected correctly to mongodb server at database " + mongoDatabase + ".");

      collectionDriver = new CollectionDriver(db);
      // db.close();
});

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());

/* GET: findAll of collection. */
app.get('/:collection', function(req, res) {
    var collectionName = req.params.collection;

    collectionDriver.findAll(collectionName, function(error, results) {
        if (error)
            res.send(400, error);
        else { 
            // if (req.accepts('html'))
            //     res.render('data', {documents: results, collection: collectionName});
            // else {
            //     res.set('Content-Type','application/json');
            //     res.json(results);
            // }
            res.set('Content-Type','application/json');
            res.json(results);
        }
    });
});

/* GET: find id in collection. */
app.get('/:collection/:id', function(req, res) {
    var collection = req.params.collection;
    var id = req.params.id;

    if (id) {
        collectionDriver.get(collection, id, function(error, results) {
            if (error)
                res.status(400).send(error);
            else
                res.status(200).send(results);
        });
    }
    else
        res.status(400).send({error: 'bad url', url: req.url});
});

/* GET: find ids to the passed grant for the given user. */
app.get('/grants/:id/:userPerm', function(req, res) {
    var grantId = req.params.id;
    var userPermissionId = req.params.userPerm;

    if (grantId) {
        collectionDriver.getCards(grantId, userPermissionId, function(error, results) {
            if (error)
                res.status(400).send(error);
            else
                res.status(200).send(results);
        });
    }
    else
        res.status(400).send({error: 'bad grant id'});
})

/* PUT: insert document in collection. */
app.put('/:collection', function(req, res) {
    var doc = req.body;
    var collection = req.params.collection;

    collectionDriver.save(collection, doc, function(error, results) {
        if (error)
            res.status(400).send(error);
        else
            res.status(201).send(results);
     });
});

/* POST: updates a document with id in the collection. */
app.post('/:collection/:id', function(req, res) {
    var docUpdates = req.body;
    var id = req.params.id;
    var collection = req.params.collection;

    if (id) {
        collectionDriver.update(collection, docUpdates, id, function(error, results) {
            if (error)
                res.status(400).send(error);
            else 
                res.status(200).send("Updated id " + id + " at collection " + collection + ".");
        });
    }
    else {
        var error = { "message" : "Cannot PUT a whole collection" };
        res.status(400).send(error);
    }
});

/* DELETE: deletes a document with id in the collection. */
app.delete('/:collection/:id', function(req, res) {
    var id = req.params.id;
    var collection = req.params.collection;

    if (id) {
        collectionDriver.delete(collection, id, function(error, results) {
            if (error)
                res.status(400).send(error);
            else
                res.status(200).send(results);
        });
    } else {
        var error = { "message" : "Cannot DELETE a whole collection" };
        res.status(400).send(error);
   }
});

app.use(function (req,res) {
    res.render('404', {url: req.url});
});

http.createServer(app).listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
});
