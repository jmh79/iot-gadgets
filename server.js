/* Moduulit */

var express = require('express');
var app = express();
var mongoose = require('mongoose');
var session = require('express-session');
var bodyParser = require('body-parser');

var Gadget = require('./gadget.js');

/* URI:t */

var uriGadgets = '/gadgets';
var uriGadgetsNew = uriGadgets + '/new';
var uriSession = '/session';

/* Käyttöliittymän polku */

var uriClient = 'client';

/* Yhdistetään tietokantaan. */

mongoose.connect('mongodb://localhost/mongobongo');

/* `express-session` valittaa, jos resave ja saveUninitialized puuttuvat. */

app.use(session({
  resave: false,            /* oletus on true, mutta suositus on false */
  saveUninitialized: false, /* oletus on true, mutta suositus on false */
  secret: 'TheEagleWillRiseAgain'
}));

/* Käyttöliittymän tarvitsemat tiedostot löytyvät alihakemistosta. */

app.use(express.static(uriClient));

/* GET /
    Avaa luettelonäkymän. */

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/' + uriClient + '/list.html');
});

/* GET `uriGadgetsNew`
    Avaa lomakkeen, jolla lisätään uusi laite. */

app.get(uriGadgetsNew, (req, res) => {
  res.sendFile(__dirname + '/' + uriClient + '/edit.html');
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

/* getGadgets() käsittelee hakutuloksia. */

var getGadgets = (res, err, result) => {

  if (err) throw err;

  res.format({
    json: function() {
      res.json(result);
    },
    'default': function() {
      res.status(406).send("Pyydettyä sisältötyyppiä ei tueta.\r\n");
    }
  });
}

/* GET `uriGadgets`
    Palauttaa kaikki laitteet JSON-muodossa. */

app.get(uriGadgets, (req, res) => {

  Gadget.find({}, (err, result) => {
    getGadgets(res, err, result);
  });
});

/* GET `uriGadgets`:in alihakemisto <id>
    Palauttaa yhden laitteen. */

app.get(uriGadgets + '/:gadgetId', (req, res) => {

  Gadget.find({ _id: req.params.gadgetId }, (err, result) => {
    getGadgets(res, err, result[0]);
  });
});

/* PUT `uriGadgetsNew`
    Tallentaa uuden laitteen. Tietojen on oltava JSON-muodossa. */

app.put(uriGadgetsNew, bodyParser.json(), (req, res) => {

  var g = new Gadget({
    name: req.body.name,
    description: req.body.description,
  });

  g.save(function(err) {
    if (err) {
      res.status(400).send('Tiedot ovat virheelliset.');
    }
    else {
      console.log('Tallennettu:', g);
      res.status(201).send('Tallennettu: ' + g.name);
    }
  });
});

/* PUT `uriGadgets`:in alihakemisto <id>
    Päivittää laitteen. Tietojen on oltava JSON-muodossa. */

app.put(uriGadgets + '/:gadgetId', bodyParser.json(), (req, res) => {

  /**** TODO ****/

  console.log('PUT:', req.body);
  res.sendStatus(200);
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
