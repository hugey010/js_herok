var app;
var express = require("express");
var logfmt = require("logfmt");
var pg = require('pg');
var crypto = require('crypto');

var app = express();

// for parsing json body
app.use(express.urlencoded());
app.use(express.json());
// logging

app.get('/', function(req, res) {
  res.send('Sup homes');
});

function userDoesntExist(username) {


}

app.post('/users', function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  console.log(req.body);
  pg.connect(process.env.node_heroku, function(err, client, done) {
    var query = 'SELECT * FROM person WHERE username = \'' + username + '\'';
    client.query(query, function(err, result) {
        if (err) {
          res.send("error reading from database");
          return console.error(err);
        }

        if (result.rows.length == 0) {
          // create user
          var salt = crypto.randomBytes(64);
          var saltedPassword = password + salt;
          var hash = crypto.createHash('sha256').update(saltedPassword, 'utf8').digest('base64');

          query = 'INSERT INTO Person (salt, pw_hash, username) VALUES (\'' + salt + '\', \'' + hash + '\', \'' + username + '\')';
          console.log("query = " + query);
          client.query(query, function(err, result) {
            if (err) {
              res.send("error creating user in database");
              return console.error(err);
            }
            
            res.send("successfully created user");

          });

        } else {
          // already created user, log them in
          console.log("already created user rows = " + result.rows);

        }
    });
  });
});

app.get('/users', function(req, res) {
  res.send('users shit');
  pg.connect(process.env.node_heroku, function(err, client, done) {
    client.query('SELECT * FROM person', function(err, result) {
        done();
        if(err) return console.error(err);
        console.log(result.rows);
    });
  });
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
