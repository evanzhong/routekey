// Setting up mongo
require('dotenv').config();
const { MongoClient } = require('mongodb');
const dbURL = process.env.DATABASE;

const path = require('path');
const parse = require('body-parser');
const express = require('express');
const urlModule = require('url');
const cron = require('cron');
const http = require("http");
const _ = require('lodash');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

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
// End DB connection

// cron jobs
var cronJob = cron.job("0 * * * * *", () => {
  MongoClient.connect(dbURL, { useNewUrlParser: true })
    .then((client) => {
      // Delete expired routekeys
      client.db('routekey').collection('routes-and-keys').deleteMany({
        expireAt: {
          $lt: new Date()
        },
      });
      // return old inUse words to false
      client.db('routekey').collection('list-of-keys').updateMany(
        {
          expireAt: {
            $lt: new Date()
          }
        },
        {
          $set: {
            inUse: false,
          },
          $unset: {
            expireAt: "",
          },
        },
        () => {
          client.close()
        }
      );
    })
    .catch(console.error);
  console.info('cron job completed');
}); 

var cronJobHttp = cron.job("* */15 * * * *", () => {
  http.get("http://routekey.herokuapp.com");
  // console.log('pinged!')
});
cronJob.start();
cronJobHttp.start();
// End cron jobs

// oAuth and passport stuff
passport.use(new GoogleStrategy(
  {
    clientID: process.env.clientID,
    clientSecret: process.env.clientSecret,
    callbackURL: "http://www.routekey.me/auth/google/admin"
  },
  (accessToken, refreshToken, profile, done) => {
    console.log(profile)
    if (profile._json.hd == 'ausdk12.org' && profile._json.email_verified) {
      return done()
    }
    else {
      console.log("Not ausdk12")
      return done(Error)
    }
    // User.findOrCreate({googleId: profile.id}, (err, user) => {
    //   return done(err, user);
    // });
  }
));

app.get('/auth/google/admin', 
  passport.authenticate('google', {scope: 'email', failureRedirect: '/'}),
  (req, res) => {
    console.log("sending admin.html");
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
  }, 
  );
// End oAuth

const doesRouteExist = (db, submittedKey) => db.collection('routes-and-keys')
  .findOne({ key: submittedKey });

// Root page
app.get('/', (req, res) => {
  const home = path.join(__dirname, 'public', 'index.html');
  res.sendFile(home);
});

// Little Easter Egg
app.get('/i-want-to-see-the-data', (req, res) => {
  const egg = path.join(__dirname, 'public', 'data.html');
  res.sendFile(egg);
});
app.post('/load-data', (req, res) => {
  const { db } = req.app.locals;
  db.collection('list-of-keys').find().toArray()
  .then((data) => {
    console.log(data)
    res.json(data)
  })
})
// End Easter Egg

// for specific keys
app.get('/:key', (req, res) => {
    const key = req.params.key;
    const { db } = req.app.locals;
    doesRouteExist(db, key)
      .then(doc => {
        if (doc === null) return res.sendFile(path.join(__dirname, 'public', 'not-found.html'));
        res.redirect(doc.route)
      })
      .catch(console.error);
});

app.post('/new-route', (req, res) => {
    // for debugging
    console.log("Route submitted: " + req.body.url);
    console.log("expireTime submitted: " + req.body.expireTime);
    // Catch passed information
    let expireTime = req.body.expireTime;
    let route;
    try {
        route = urlModule.parse(req.body.url);
        // console.log("try catch generated: " + route);
    } catch (err) {
        // console.log("Error in try catch");
        return res.status(400).send({error: 'invalid URL'});
    }
    const { db } = req.app.locals;

    // Being writing new routes to DB
    const routes = db.collection('routes-and-keys');
    const potentialKeys = db.collection('list-of-keys');
    var selectedKey;
    var currentDate = new Date();

    potentialKeys.countDocuments({"inUse": false})
    .then((count) => {
      const randIndex = Math.floor(Math.random() * count);
      console.log("count: " + count + " randIndex: " + randIndex);
      return randIndex;
    })
    .then((randIndex) => {
      return selectedKeyCursor = potentialKeys.find({"inUse": false}).skip(randIndex).limit(-1).toArray();
    })
    .then((data) => {
      selectedKey = data[0];
      console.log("The selectedKey:")
      console.log(selectedKey);
      routes.insertOne(
        {
          route: route.href,
          key: selectedKey.word,
          "expireAt": new Date(currentDate.getTime() + expireTime*60000),
        }
      );
      potentialKeys.updateOne(
        {_id: selectedKey._id},
        {
          $set: {
            inUse: true,
            "expireAt": new Date(currentDate.getTime() + expireTime*60000),
          },
          $inc: {
            usage: 1
          }
        }
      );
      return selectedKey
    })
    .then((selectedKey) => {
      res.json({
        key: selectedKey.word,
        morris: selectedKey.isMorrisism
      });
    })
    .catch(console.error);
});

// Local testing
app.set('port', process.env.PORT || 4100);
const server = app.listen(app.get('port'), () => {
  console.log(`Express running at PORT ${server.address().port}`);
});
