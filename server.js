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
var uriEdit = '/edit';
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
/*
app.get(uriGadgetsNew, (req, res) => {
  res.sendFile(__dirname + '/' + uriClient + '/new.html');
});
*/
/* GET `uriGadgets`/<id>/edit
    Avaa lomakkeen, jolla laitteen tietoja muokataan. */
/*
app.get(uriGadgets + '/:gadgetId' + uriEdit, (req, res) => {
  res.sendFile(__dirname + '/' + uriClient + '/edit.html');
});
*/

/* logRequest() kirjaa HTTP-pyynnön konsoliin. */

function logRequest(req) {
  var pad = (n) => { return (n < 10) ? ('0' + n) : n; }
  var timestamp = new Date();
  console.log(
    timestamp.getFullYear() + '-' +
    pad(timestamp.getMonth() + 1) + '-' +
    pad(timestamp.getDate()) + ' ' +
    pad(timestamp.getHours()) + ':' +
    pad(timestamp.getMinutes()) + ':' +
    pad(timestamp.getSeconds()) + ' ' +
    req.method + ' ' + req.url
  );
}

/* getGadgets() käsittelee hakutuloksia. */

var getGadgets = (res, err, result) => {

  if (err) {
    res.status(400).send('Väärin muotoiltu kysely.');
  }

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

  logRequest(req);

  Gadget.find({}, (err, result) => {
    getGadgets(res, err, result);
  });
});

/* GET `uriGadgets`/<id>
    Palauttaa yhden laitteen. */

app.get(uriGadgets + '/:gadgetId', (req, res) => {

  logRequest(req);

  Gadget.find({ _id: req.params.gadgetId }, (err, result) => {
    if (!result || result.length < 1) {
      res.status(400).send('Pyydettyä laitetta ei löydy.');
    }
    else {
      getGadgets(res, err, result[0]);
    }
  });
});

/* PUT `uriGadgetsNew`
    Tallentaa uuden laitteen. Tietojen on oltava JSON-muodossa. */

app.put(uriGadgetsNew, bodyParser.json(), (req, res) => {

  logRequest(req);

  var g = new Gadget({
    name: req.body.name,
    description: req.body.description
  });

  /* MongoDB ei tallenna laitetta, jos jokin vaadittu kenttä on tyhjä. */

  g.save(function(err) {
    if (err) {
      res.status(400).send('Tiedot ovat virheelliset.');
    }
    else {
      console.log('Tallennettu:', g);
      res.status(201).send(g._id);
    }
  });
});

/* PUT `uriGadgets`/<id>
    Päivittää laitteen. Tietojen on oltava JSON-muodossa. */

app.put(uriGadgets + '/:gadgetId', bodyParser.json(), (req, res) => {

  logRequest(req);

  /*
  Gadget.findByIdAndUpdate(req.params.gadgetId,
    {
      ////////username: 'starlord88'
      name: req.body.name,
      description: req.body.description
    },
    function(err, g) {
      if (err) throw err;
      console.log(g);
    }
  );
  */

  console.log('Päivitetään:', req.body);
  res.sendStatus(200);
});

/* DELETE `uriGadgets`/<id>
    Poistaa laitteen. */

app.delete(uriGadgets + '/:gadgetId', (req, res) => {

  logRequest(req);

  Gadget.findByIdAndRemove(req.params.gadgetId, (err) => {
    if (err) throw err;
    res.sendStatus(204);  // OK, No Content (Firefox sanoo "no element found")
  });
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
