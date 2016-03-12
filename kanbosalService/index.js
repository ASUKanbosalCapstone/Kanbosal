var http = require('http');
var express = require('express');
var path = require('path');

var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
// var ObjectId = require('mongodb').ObjectID;
var Server = require('mongodb').Server;
var CollectionDriver = require('./collectionDriver').CollectionDriver;
var bodyParser = require('body-parser');

var app = express();
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// Change if running elsewhere
var mongoHost = 'localHost';
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
    // var params = req.params;

    collectionDriver.findAll(collectionName, function(error, documents) {
        if (error)
            res.send(400, error);
        else { 
            if (req.accepts('html'))
                res.render('data', {documents: documents, collection: collectionName});
            else {
                res.set('Content-Type','application/json');
                res.json(documents);
            }
        }
    });
});

/* GET: find id in collection. */
app.get('/:collection/:id', function(req, res) {
    var collection = req.params.collection;
    var id = req.params.id;

    if (id) {
        collectionDriver.get(collection, id, function(error, documents) {
            if (error)
                res.status(400).send(error);
            else
                res.status(200).send(documents);
        });
    }
    else
        res.status(400).send({error: 'bad url', url: req.url});
});

/* POST: insert document in collection. */
app.post('/:collection', function(req, res) {
    var object = req.body;
    var collection = req.params.collection;

    collectionDriver.save(collection, object, function(error, doc) {
        if (error)
            res.status(400).send(error);
        else
            res.status(201).send(doc);
     });
});

app.use(function (req,res) {
    res.render('404', {url:req.url});
});

http.createServer(app).listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
});
