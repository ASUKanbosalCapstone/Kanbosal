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
app.set('port', process.env.PORT || 3000);
app.use(express.static(path.join(__dirname, '../client')));
app.use(bodyParser.json());
app.set('views', __dirname + '/../client');
app.engine('html', ejs.renderFile);
app.set('view engine', 'html');

// Sets up our session variable definitions
app.use(sessions({
  cookieName: 'session',
  secret: 'This is the super secret secret for Kanbosal, no funny business.',
  duration: 30 * 60 * 1000, // 30 minutes
  activeDuration: 5 * 60 * 1000, // 5 minutes
  httpOnly: true,
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

/* Checks if the user in session is an admin */
var authenticateAdmin = function(req, res, next) {
    if (req.session.user) {
        if (req.session.user.permissions.level == 1)
            next();
        else
            res.redirect('/');
    }
    else
        res.redirect('/');
}

/* Loads homepage. */
app.get('/', function(req, res) {
    res.render('index.html');
})

/* GET: find a user by email and set session variable. */
app.get('/login', function(req, res) {
    var queryData = req.query;
    if (!queryData.hasOwnProperty('email')) res.status(400).send({error: 'no email specified'});
    else collectionDriver.findSome('users', queryData, function(error, results) {
        if (error) res.status(400).send(error);
        else {
            req.session.user = results;
            res.json(results);
        }
    });
});

/* Deletes the current session variable and redirects to homepage. */
app.get('/logout', function(req, res) {
    req.session.reset();
    res.redirect('/');
});

/* Returns the current user stored in the session */
app.get('/currentUser', authenticate, function(req, res) {
    res.json(req.session.user);
});

/* Loads overview. */
app.get('/overview', authenticate, function(req, res) {
    res.render('overview.html');
});

/* GET: returns the grants the user can see. */
app.get('/getOverview', authenticate, function(req, res) {
    var userId = req.session.user._id;

    if (userId) {
        collectionDriver.getGrants(userId, function(error, results) {
            if (error)
                res.status(400).send(error);
            else {
                var overview = {
                    user: req.session.user,
                    grants: results
                };
                res.json(overview);
            }
        });
    }
    else
        res.status(400).send({error: 'bad user id'});
});

/* Loads detail. */
app.get('/detail', authenticate, function(req, res) {
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
app.get('/getDetail', authenticate, function(req, res) {
    if (!req.session.grantLoadId)
        res.redirect('/overview');

    var userPermissionId = req.session.user.permissions.stage;
    var grantId = req.session.grantLoadId;

    collectionDriver.getCards(grantId, userPermissionId, function(error, results) {
        if (error)
            res.status(400).send(error);
        else{
            var detailView = {
                user: req.session.user,
                cards: results
            };
            res.json(detailView);
        }
    });
});

/* Loads admin */
app.get('/admin', authenticateAdmin, function(req, res) {
    res.render('admin.html');
});

/* GET: returns users separated by stage */
app.get('/getAdmin', authenticateAdmin, function (req, res) {
    var resultData = {
        user: req.session.user,
        pageData: {
            pendingUsers: [],
            departments: [{
                dept: 'Research',
                description: 'The <span class="fa fa-rotate-90"><i class="fa fa-flip-vertical fa-key"></i></span> symbol denotes a principle level member.',
                users: []
            }, {
                dept: 'Internal Review',
                description: '',
                users: []
            }, {
                dept: 'ASU Review',
                description: '',
                users: []
            }],
            inactiveUsers: []
        }
    };

    collectionDriver.findSome('users', { 'permissions.stage': -1 }, setPending);

    function setPending(error, results) {
        if (error) res.status(400).send(error);
        else {
            resultData.pageData.pendingUsers = results;
            collectionDriver.findSome('users', { 'permissions.stage': 0 }, getResearch);
        }
    };
    function getResearch(error, results) {
        if (error) res.status(400).send(error);
        else {
            resultData.pageData.departments[0].users = results;
            collectionDriver.findSome('users', { 'permissions.stage': 1 }, getInternal);
        }
    };
    function getInternal(error, results) {
        if (error) res.status(400).send(error);
        else {
            resultData.pageData.departments[1].users = results;
            collectionDriver.findSome('users', { 'permissions.stage': 2 }, getASU);
        }
    };
    function getASU(error, results) {
        if (error) res.status(400).send(error);
        else {
            resultData.pageData.departments[2].users = results;
            collectionDriver.findSome('users', { 'permissions.stage': -2 }, getInactive);
        }
    };
    function getInactive(error, results) {
        if (error) res.status(400).send(error);
        else {
            resultData.pageData.inactiveUsers = results;
            res.status(200).send(resultData);
        }
    };
});

/* GET: findAll of collection. or enter query to narrow down list*/
app.get('/:collection', authenticate, function(req, res) {
    var collectionName = req.params.collection;
    var queryData = req.query;

    if (Object.keys(queryData).length === 0 && JSON.stringify(queryData) === JSON.stringify({}))
        collectionDriver.findAll(collectionName, function (error, results) {
            if (error)res.status(400).send(error);
            else res.status(200).send(results);
        });
    else
        collectionDriver.findSome(collectionName, queryData, function (error, results) {
            if (error)res.status(400).send(error);
            else res.status(200).send(results);
        });
});

/* GET: find id in collection. */
app.get('/:collection/:id', authenticate, function(req, res) {
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

/* For inserting new users */
app.put('/users', function(req, res) {
    var doc = req.body;
    var collection = req.params.collection;

    collectionDriver.save("users", doc, 0, function(error, results) {
        if (error)
            res.status(400).send(error);
        else
            res.json(results);
     });
});

/* PUT: insert document in collection. */
app.put('/:collection', authenticate, function(req, res) {
    var doc = req.body;
    var collection = req.params.collection;
    var userId = req.session.user._id;

    collectionDriver.save(collection, doc, userId, function(error, results) {
        if (error)
            res.status(400).send(error);
        else
            res.json(results);
     });
});

/* Sets the stage of an admin to the desired stage they want to view */
app.post('/setAdminStage', authenticateAdmin, function(req, res) {
    var newStage = req.query.stage;

    if (newStage) {
        req.session.user.permissions.stage = newStage;
        res.status(200).send(true);
    }
    else
        res.status(400).send({error: 'bad query'})
});

/* Moves the card given from curCol to newCol */
app.post('/moveCard/:id', authenticate, function(req, res) {
    var card = {
        id: req.params.id,
        curStage: req.session.user.permissions.stage,
        curCol: req.query.curCol,
        newStage: req.session.user.permissions.stage,
        newCol: req.query.newCol
    };
    var grantId = req.session.grantLoadId;

    collectionDriver.moveCard(grantId, card, function(error, results) {
        if (error)
            res.status(400).send(error);
        else
            res.status(200).send(results);
    });
});

/* Allows admins to move the card from the current stage to the next one */
app.post('/moveCardStage/:id', authenticateAdmin, function(req, res) {
    var back = req.query.back;
    var stage = req.session.user.permissions.stage;
    var grantId = req.session.grantLoadId;
    var columnDestination;

    if(parseInt(stage) + 1 != 3) {
      columnDestination = "toDo";
    }
    else {
      columnDestination = "cards";
    }

    var card = {
        id: req.params.id,
        curStage: parseInt(stage),
        curCol: "complete",
        newStage: parseInt(stage) + 1,
        newCol: columnDestination
    };

    if (back) {
        card.curCol = "toDo";
        card.newStage = parseInt(stage) - 1;
        card.newCol = "complete";
    }

    collectionDriver.moveCardStage(grantId, card, back, function(error, results) {
        if (error)
            res.status(400).send(error);
        else
            res.status(200).send(results);
    });
});

/* Updates the grant in session. */
app.post('/updateGrant', authenticate, function(req, res) {
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
app.delete('/:collection/:id', authenticate, function(req, res) {
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
