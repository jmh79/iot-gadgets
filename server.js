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
  else {
    res.format({
      json: function() {
        res.json(result);
      },
      'default': function() {
        res.status(406).send("Pyydettyä sisältötyyppiä ei tueta.\r\n");
      }
    });
  }
}

/******** Luettelonäkymän avaus: GET /
*/

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/' + uriClient + '/list.html');
});

/******** Kaikkien laitteiden haku: GET `uriGadgets`
  Laitelista palautetaan JSON-muodossa. */

app.get(uriGadgets, (req, res) => {

  logRequest(req);

  Gadget.find({}, (err, gadgets) => {
    getGadgets(res, err, gadgets);
  });
});

/******** Yhden laitteen haku: GET `uriGadgets`/<id>
*/

app.get(uriGadgets + '/:gadgetId', (req, res) => {

  logRequest(req);

  Gadget.findById(req.params.gadgetId, (err, g) => {
    if (!g) {
      res.status(404).send('Pyydettyä laitetta ei löydy.');
    }
    else {
      getGadgets(res, err, g);
    }
  });
});

/******** Uuden laitteen tallennus: PUT `uriGadgetsNew`
  Tietojen on oltava JSON-muodossa. */

app.put(uriGadgetsNew, bodyParser.json(), (req, res) => {

  logRequest(req);

  var g = new Gadget({
    name: req.body.name,
    description: req.body.description
  });

  /* Jokaiseen tietokannan päivitykseen liitetään aikaleima. */

  var currentDate = new Date();
  g.created_at = currentDate;
  g.updated_at = currentDate;

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

/******** Laitteen päivitys: PUT `uriGadgets`/<id>
  Tietojen on oltava JSON-muodossa.
  Viestin ei tarvitse sisältää tietoja, joita ei haluta muuttaa. */

app.put(uriGadgets + '/:gadgetId', bodyParser.json(), (req, res) => {

  logRequest(req);

  /* Lisätään päivityksen aikaleima.
      Jostain syystä tämä ei onnistu `pre('update')`:lla. */

  req.body.updated_at = new Date();

  Gadget.update({ _id: req.params.gadgetId }, req.body, function(err) {
    if (err) throw err;
    console.log('Päivitetty:', req.body);
  });

  res.sendStatus(200);
});

/******** Laitteen poisto: DELETE `uriGadgets`/<id>
*/

app.delete(uriGadgets + '/:gadgetId', (req, res) => {

  logRequest(req);

  Gadget.findByIdAndRemove(req.params.gadgetId, (err) => {
    if (err) throw err;
    console.log('Poistettu:', req.params.gadgetId);
    res.sendStatus(204);  // OK, No Content (Firefox sanoo "no element found")
  });
});

/* sendPropertyValue() lähettää ominaisuuden arvon HTTP-vastauksena. */

var sendPropertyValue = (value, res) => {
  res.status(200).send(
    (typeof value == 'number') ? value.toString() : value
  );
}

/******** Ominaisuuden haku: GET `uriGadgets`/<id>/<ominaisuus>
  Tieto palautetaan tekstimuodossa. */

app.get(uriGadgets + '/:gadgetId/:propertyKey', (req, res) => {

  logRequest(req);

  Gadget.findById(req.params.gadgetId, (err, g) => {

    if (!g) {
      res.status(404).send('Pyydettyä laitetta ei löydy.');
    }
    else {
      var key = req.params.propertyKey;
      if (key in g) {
        sendPropertyValue(g[key], res);
      }
      else {
        //console.log(g);
        if (g.extra && key in g.extra) {
          sendPropertyValue(g.extra[key], res);
        }
        else {
          res.status(404).send('Ominaisuutta "' + key + '" ei löydy.');
        }
      }
    }
  });
});

/******** Ominaisuuden tallennus: PUT `uriGadgets`/<id>/<ominaisuus>
  Tietojen on oltava tekstimuodossa.
  Poikkeuksena 'location', jonka on oltava JSON-muodossa.
  Jos ominaisuutta ei ole olemassa, se luodaan 'extra'-olion sisään. */

app.put(uriGadgets + '/:gadgetId/:propertyKey', bodyParser.json(), bodyParser.text(), (req, res) => {

  logRequest(req);

  Gadget.findById(req.params.gadgetId, (err, g) => {

    if (!g) {
      res.status(404).send('Pyydettyä laitetta ei löydy.');
    }
    else {

      /* http://stackoverflow.com/a/10805292 */

      //var newValue = req.body.replace(/\r?\n|\r|\t/g, '');
      var newValue = req.body;
      var newData = {
        updated_at: new Date()  // päivityksen aikaleima
      }
      var key = req.params.propertyKey;
      var successMessage = 'Päivitetty';

      if (key in g) {
        newData[key] = /*(key === 'location') ?
          JSON.parse(newValue) :*/
          newValue;
      }
      else {
        newData.extra = {};
        if (g.extra) {
          for (var attr in g.extra) {
            newData.extra[attr] = g.extra[attr];
          }
        }
        if (!(key in g.extra))
          successMessage = 'Lisätty';
        newData.extra[key] = newValue;
      }

      Gadget.update({ _id: req.params.gadgetId }, newData, function(err) {
        if (err) {
          res.status(400).send('Tiedot ovat virheelliset.');
        }
        else {
          console.log(successMessage + ': ' + key + ' = "' + newValue + '"');
          res.sendStatus(200);
        }
      });
    }
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
