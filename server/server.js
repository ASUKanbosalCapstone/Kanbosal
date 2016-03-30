// Requirements
var http = require('http');
var express = require('express');
var ejs = require('ejs');
var path = require('path');
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var CollectionDriver = require('./collectionDriver').CollectionDriver;
var bodyParser = require('body-parser');
var cors = require('cors');
var sessions = require('client-sessions');
var app = express();

// Express settings
app.set('port', process.env.PORT || 8080);
app.use(express.static(path.join(__dirname, '../client')));
app.use(bodyParser.json());
app.set('views', __dirname + '/../client');
app.engine('html', ejs.renderFile);
app.set('view engine', 'html');

// Sets up our session variable definitions
app.use(sessions({
  cookieName: 'session',
  secret: 'random_string_goes_here',
  duration: 30 * 60 * 1000, // 30 minutes
  activeDuration: 5 * 60 * 1000 // 5 minutes
}));

// Might need to change based on localhost's port. Allows for the client to make ajax calls to the server.
// app.use(cors({origin: 'http://localhost:8080'}));
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "http://localhost:8080");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

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

app.get('/', function(req, res) {
    res.render('index.html');
})

/* GET: find a user by email or return all users. */
app.get('/login', function(req, res) {
    var email = req.query.email;

    if (email) {
        collectionDriver.getEmail(email, function(error, results) {
            if (error)
                res.status(400).send(error);
            else {
                req.session.user = results;
                res.json(results);
            }
        });
    }
    else
        res.status(400).send({error: 'bad url', url: req.url});
});

/* GET: deletes the current session variable. */
app.get('/logout', function(req, res) {
    req.session.reset();
    res.status(200).send(true);
});

app.get('/currentUser', function(req, res) {
    console.log("hi");
    res.json(req.session.user);
});

app.get('/overview', function(req, res) {
    res.render('overview.html');
});

/* GET: returns the grants the user can see. */
app.get('/getOverview', function(req, res) {
    if (req.session) {
        var userId = req.session.user._id;

        if (userId) {
            collectionDriver.getGrants(userId, function(error, results) {
                if (error)
                    res.status(400).send(error);
                else{
                    res.json(results);
                }
            });
        }
        else
            res.status(400).send({error: 'bad user id'});
    }
    else
        res.status(400).send({error: 'no user'});
});

app.get('/detail/:id', function(req, res) {
    req.session.grantId = req.params.id;
    console.log(req.session.grantId);
    res.render('detail.html');
});

// app.get('/setGrant/:id', function(req, res) {
//     req.session.grantId = req.params.id;
//     console.log(req.session.grantId);
//     res.status(200).send(true);
// });

/* GET: returns the cards belonging to the grant the user can see */
app.get('/getDetail', function(req, res) {
    if (req.session) {
        var userPermissionId = req.session.user.permissions.stage;
        var grantId = req.session.grantId;

        if (userPermissionId && grantId) {
            collectionDriver.getCards(grantId, userPermissionId, function(error, results) {
                if (error)
                    res.status(400).send(error);
                else
                    res.json(results);
            });
        }
        else
            res.status(400).send({error: 'bad grant id'});
    }
    else
        res.status(400).send(null);
});

/* GET: returns grants belonging to the given user. */
app.get('/users/:id/grants', function(req, res) {
    var userId = req.params.id;

    if (userId) {
        collectionDriver.getGrants(userId, function(error, results) {
            if (error)
                res.status(400).send(error);
            else
                res.json(results);
        });
    }
    else
        res.status(400).send({error: 'bad user id'});
});

/* GET: findAll of collection. */
app.get('/:collection', function(req, res) {
    var collectionName = req.params.collection;

    collectionDriver.findAll(collectionName, function(error, results) {
        if (error)
            res.status(400).send(error);
        else {
            res.status(200).send(results);
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
                res.json(results);
        });
    }
    else
        res.status(400).send({error: 'bad url', url: req.url});
});

/* PUT: insert document in collection. */
app.put('/:collection', function(req, res) {
    var doc = req.body;
    var collection = req.params.collection;

    collectionDriver.save(collection, doc, function(error, results) {
        if (error)
            res.status(400).send(error);
        else
            res.json(results);
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
        var error = { "message" : "Cannot POST a whole collection" };
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
