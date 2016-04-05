// Requirements
var http = require('http');
var express = require('express');
var ejs = require('ejs');
var path = require('path');
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var CollectionDriver = require('./collectionDriver').CollectionDriver;
var bodyParser = require('body-parser');
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
  activeDuration: 5 * 60 * 1000, // 5 minutes
  ephemeral: true
}));

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
});

/* Checks if a user is in our session variable otherwise redirects to home page. */
var authenticate = function(req, res, next) {
    if (req.session.user)
        next();
    else
        res.redirect('/');
}

/* Loads homepage. */
app.get('/', function(req, res) {
    res.render('index.html');
})

/* GET: find a user by email and set session variable. */
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

/* Deletes the current session variable and redirects to homepage. */
app.get('/logout', function(req, res) {
    req.session.reset();
    res.redirect('/');
});

/* Loads overview. */
app.get('/overview', authenticate, function(req, res) {
    res.render('overview.html');
});

/* GET: returns the grants the user can see. */
app.get('/getOverview', function(req, res) {
    var userId = req.session.user._id;

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

/* Loads detail. */
app.get('/detail', function(req, res) {
    if (req.session.grantLoadId)
        res.render('detail.html');
    else
        res.redirect('/');
});

/* Sets the grant to load in the session. */
app.get('/detail/:id', authenticate, function(req, res) {
    req.session.grantLoadId = req.params.id;
    res.redirect('/detail');
});

/* GET: returns the cards belonging to the grant the user can see */
app.get('/getDetail', function(req, res) {
    if (!req.session.grantLoadId)
        res.redirect('/overview');

    var userPermissionId = req.session.user.permissions.stage;
    var grantId = req.session.grantLoadId;

    collectionDriver.getCards(grantId, userPermissionId, function(error, results) {
        if (error)
            res.status(400).send(error);
        else
            res.json(results);
    });
});

/* Loads admin */
app.get('/admin', function(req, res) {
    res.render('admin.html');
});

/* GET: returns users with specified stage permissions */
app.get('/manageUsers', function(req, res) {
    var query = req.query;

    if (query.hasOwnProperty('permissions.stage'))  // uri only reads string values
        query['permissions.stage'] = parseInt(query['permissions.stage'], 10);

    collectionDriver.getUsersByDept(query, function(error, results) {
        if (error)
            res.status(400).send(error);
        else
            res.status(200).send(results);
    });
});

/* GET: findAll of collection. or enter query to narrow down list*/
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

/* Moves the card given from curCol to newCol */
app.post('/moveCard/:id', authenticate, function(req, res) {
    var card = {
        id: req.params.id,
        curCol: req.query.curCol,
        newCol: req.query.newCol
    };
    var grantId = req.session.grantLoadId;
    var userPermissionId = req.session.user.permissions.stage;
    // console.log(docUpdates);

    collectionDriver.moveCard(grantId, card, userPermissionId, function(error, results) {
        if (error)
            res.status(400).send(error);
        else
            res.status(200).send(results);
    });
    // res.json(docUpdates);
});

/* Updates the grant in session. */
app.post('/updateGrant', function(req, res) {
    var docUpdates = req.body;
    var grantId = req.session.grantLoadId;
    var userId = req.session.user._id;


    collectionDriver.update("grants", docUpdates, grantId, userId, function(error, results) {
        if (error)
            res.status(400).send(error);
        else
            res.status(200).send("Updated grant " + grantId + " with " + results + ".");
    });
});

/* POST: updates a document with id in the collection. */
app.post('/:collection/:id', authenticate, function(req, res) {
    var userId = req.session.user._id;
    var docUpdates = req.body;
    var id = req.params.id;
    var collection = req.params.collection;

    if (id) {
        collectionDriver.update(collection, docUpdates, id, userId, function(error, results) {
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
