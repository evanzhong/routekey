// Setting up mongo
require('dotenv').config();
const { MongoClient } = require('mongodb');
const dbURL = process.env.DATABASE;

const path = require('path');
const parse = require('body-parser');
const express = require('express');

const app = express();

app.use(express.static(path.join(__dirname, 'public')))
app.use(parse.json());

// Connecting to the DB
MongoClient.connect(dbURL, { useNewUrlParser: true })
  .then(client => {
    app.locals.db = client.db('routeskey');
  })
  .catch(() => console.error('DB connection failed :('));

const writeRoute = (db, url) => {
  const routes = db.collection('routes-and-keys');
  return routes.findOneAndUpdate({ route: url },
    {
      $setOnInsert: {
        route: url,
        key: nanoid(7),
      },
    },
    {
      returnOriginal: false,
      upsert: true,
    }
  );
};

// Root page
app.get('/', (req, res) => {
    const home = path.join(__dirname, 'public', 'index.html');
    res.sendFile(home);
});

app.post('/new-route', (req, res) => {
    // for debugging
    console.log("Route submitted: " + req.body.url);
    
    let route;
    try {
        route = new URL(req.body.url);
    } catch (err) {
        return res.status(400).send({error: 'invalid URL'});
    }
});

// Local testing
app.set('port', process.env.PORT || 4100);
const server = app.listen(app.get('port'), () => {
  console.log(`Express running at PORT ${server.address().port}`);
});
