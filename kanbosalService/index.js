var http = require('http');
var express = require('express');
var path = require('path');

var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var ObjectId = require('mongodb').ObjectID;

// var CollectionDriver = require('./collectionDriver').CollectionDriver;

var app = express();
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// Change if running elsewhere
var mongoHost = 'localHost';
var mongoPort = 27017;
var mongoDatabase = 'kanbosal';
var url = 'mongodb://' + mongoHost + ':' + 27017 + '/' + mongoDatabase;
// var collectionDriver;
 
// var mongoClient = new MongoClient(new Server(mongoHost, mongoPort));

// mongoClient.connect(function(err, mongoClient) {
//     if (!mongoClient) {
//         console.error("Error! Exiting... Must start MongoDB first");
//         process.exit(1);
//     }

//     var db = mongoClient.db("kanbosal");
//     collectionDriver = new CollectionDriver(db);
// });


// MongoClient.connect(url, function(err, db) {
//   assert.equal(null, err);
//   console.log("Connected correctly to server.");
//   db.close();
// });

app.use(express.static(path.join(__dirname, 'public')));

// app.get('/', function (req, res) {
//     res.send('<html><body><h1>Hello World</h1></body></html>');
// });

app.get('/:collection', function(req, res) {
    MongoClient.connect(url, function(err, db) {
        assert.equal(null, err);
        findAll(db, req.params.collection, function() {
            db.close();
        });
    });

    var findAll = function(db, collectionName, callback) {
        var cursor = db.collection(collectionName).find();

        cursor.each(function(err, doc) {
            assert.equal(err, null);

            if (doc != null) {
                // console.dir(doc);
                res.set('Content-Type','application/json');
                res.status(200).send(doc)
            }
            else
                callback();
        });
    };

    // var params = req.params;

    // collectionDriver.findAll(req.params.collection, function(error, objs) {
    //     if (error)
    //         res.send(400, error);
    //     else { 
    //         if (req.accepts('html'))
    //             res.render('data',{objects: objs, collection: req.params.collection});
    //         else {
    //             res.set('Content-Type','application/json');
    //             res.send(200, objs);
    //         }
    //     }
    // });
});
 
app.get('/:collection/:entity', function(req, res) {
    var params = req.params;
    var entity = params.entity;
    var collection = params.collection;

    if (entity) {
        collectionDriver.get(collection, entity, function(error, objs) {
            if (error)
                res.send(400, error);
            else
                res.send(200, objs);
        });
    }
    else
        res.send(400, {error: 'bad url', url: req.url});
});

app.use(function (req,res) { //1
    res.render('404', {url:req.url}); //2
});

http.createServer(app).listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
});

var mongoConnect = function(functionName) {
    MongoClient.connect(url, function(err, db) {
        assert.equal(null, err);
        findAll(db, req.params.collection, function() {
            db.close();
        });
    });
}
