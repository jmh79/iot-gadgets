/* Moduulit */

var express = require('express');
var app = express();
var mongoose = require('mongoose');
var session = require('express-session');
var bodyParser = require('body-parser');

var Gadget = require('./gadget.js');

/* URI:t */

var uriGadgets = '/gadgets';
var uriSession = '/session';

/* Käyttöliittymän polku */

var uriClient = 'client';

/* Yhdistetään tietokantaan. */

mongoose.connect('mongodb://localhost/mongobongo');

/*
iot.save(function(err) {
  if (err) throw err;
  console.log("'" + iot.name + "' tallennettu.");
});
*/

/* `express-session` valittaa, jos resave ja saveUninitialized puuttuvat. */

app.use(session({
  resave: false,            /* oletus on true, mutta suositus on false */
  saveUninitialized: false, /* oletus on true, mutta suositus on false */
  secret: 'TheEagleWillRiseAgain'
}));

/* Käyttöliittymän tarvitsemat tiedostot löytyvät alihakemistosta. */

app.use(express.static(uriClient));

/* GET-pyyntö juurihakemistoon avaa luettelonäkymän. */

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/' + uriClient + '/list.html');
});

/* Yhden käyttäjän haku vaatii sisäänkirjautumisen. */

/*
app.get(uriGadgets + '/:username', (req, res) => {

  if ("login" in req.session) {

    User.find({ username: req.params.username }, (err, u) => {

      if (err) throw err;

      if (u.length > 0) {
        //u[0].isAdmin();
        res.send(JSON.stringify(u[0]) + "\r\n");
      }
      else {
        res.status(404).send("Käyttäjää ei löydy.\r\n");
      }

    });
  }
  else {

    res.status(401).send("Sisäänkirjautuminen vaaditaan.\r\n");
  }

});
*/

/* Kaikkien käyttäjien haku vaatii sisäänkirjautumisen. */
/* Nimittäin sitten myöhemmin. */

app.get(uriGadgets, (req, res) => {

  Gadget.find({}, (err, result) => {

    if (err) throw err;

    /*
    res.format({
      json: function() {
        res.send(JSON.stringify(result) + "\r\n");
      },
      'default': function() {
        res.status(406).send("Pyydettyä sisältötyyppiä ei tueta.\r\n");
      }
    });
    */

    res.json(result);

  });
});

/* Sisäänkirjautuminen */

/*
app.post(uriSession, bodyParser.json(), (req, res) => {

  User.find({
    username: req.body.username,
    password: req.body.sha256
  }, (err, u) => {

    if (err) throw err;

    if (u.length === 1) {

      console.log(req.session);

      if ("login" in req.session) {
        res.status(409).send('Istunto on jo olemassa.\r\n');
      }
      else {
        req.session.login = req.body.username;
        res.status(201).send('Istunto avattu käyttäjälle ' + req.body.username + '.\r\n');
      }

    }
    else
      res.status(404).send("Väärä käyttäjänimi tai salasana\r\n");

  });

});
*/

/* Uloskirjautuminen */

app.delete(uriSession, (req, res) => {

  if ("login" in req.session) {
    delete req.session.login;
    res.status(200).send('Uloskirjautuminen onnistui.\r\n');
  }
  else {
    res.status(404).send('Istuntoa ei ole avattu.\r\n');
  }

});

/* Käynnistetään palvelin. */

app.listen(8080);

/*
User.find({ username: 'blunstone' }, function(err, u) {
  if (err) throw err;
  if (u.length > 0) {
    u[0].remove(function(err) {
      if (err) throw err;
      console.log("'" + u[0].username + "' poistettu.");
    });
  }
  else {
    console.log("Käyttäjää ei löydy.");
  }
});
*/
