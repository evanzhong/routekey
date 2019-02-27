// Setting up mongo
require('dotenv').config();
const { MongoClient } = require('mongodb');
const dbURL = process.env.DATABASE;

const path = require('path');
const parse = require('body-parser');
const express = require('express');
const urlModule = require('url');
const _ = require('lodash');

const app = express();

app.use(express.static(path.join(__dirname, 'public')))
app.use(parse.json());

// Connecting to the DB
MongoClient.connect(dbURL, { useNewUrlParser: true })
  .then(client => {
    app.locals.db = client.db('routekey');
    console.log("DB connection succesful at " + dbURL)
  })
  .catch(() => console.error('DB connection failed :('));

const writeRoute = (db, url) => {
  const routes = db.collection('routes-and-keys');
  const potentialKeys = db.collection('list-of-free-keys');
  const usedKeys = db.collection('keys-in-use');
  var selectedKey;
  const totalDocuments = potentialKeys.countDocuments({"inUse": false}).then((count) => {
      const randIndex = Math.round(Math.random() * count);
      console.log("count: " + count + " randIndex: " + randIndex);
      selectedKey = potentialKeys.find().limit(-1).skip(randIndex);
      console.log("\n\n\n" + selectedKey);
  });
//   Change the below to delete and insert the value into keys-in-use
  potentialKeys.findOneAndUpdate({_id: selectedKey._id},
    {
        $setOnInsert: {
            _id: selectedKey._id,
            num: selectedKey.num,
            word: selectedKey.word,
            inUse: true
        },
    },
    {
        returnOriginal: false,
        upsert: true,
    }
    );

  return routes.findOneAndUpdate({route: url},
    {
      $setOnInsert: {
        route: url,
        key: selectedKey.word,
      },
    },
    {
      returnOriginal: false,
      upsert: true,
    }
  );
};

const doesRouteExist = (db, submittedKey) => db.collection('routes-and-keys')
  .findOne({ key: submittedKey });

// Root page
app.get('/', (req, res) => {
    const home = path.join(__dirname, 'public', 'index.html');
    res.sendFile(home);
});

// for specific keys
app.get('/:key', (req, res) => {
    const key = req.params.key;
    const { db } = req.app.locals;
    doesRouteExist(db, key)
      .then(doc => {
        if (doc === null) return res.send('no routekey in DB');
        res.redirect(doc.route)
      })
      .catch(console.error);
});

app.post('/new-route', (req, res) => {
    // for debugging
    console.log("Route submitted: " + req.body.url);
    
    let route;
    try {
        route = urlModule.parse(req.body.url);
        console.log("try catch generated: " + route);
    } catch (err) {
        console.log("Error in try catch");
        return res.status(400).send({error: 'invalid URL'});
    }
    const { db } = req.app.locals;
    writeRoute(db, route.href)
      .then(result => {
        const doc = result.value;
        console.log(doc);
        res.json({
          route: doc.route,
          key: doc.key,
        });
      })
      .catch(console.error);
});

// Local testing
app.set('port', process.env.PORT || 4100);
const server = app.listen(app.get('port'), () => {
  console.log(`Express running at PORT ${server.address().port}`);
});
