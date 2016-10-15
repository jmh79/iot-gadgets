# iot-gadgets

## Tarvittavat ohjelmat

Sovellus on tehty Ubuntu 16.04:ssä näitä paketteja käyttäen:

| paketti | versio |
| --- | --- |
| nodejs | 4.2.6~dfsg-1ubuntu4.1 |
| nodejs-legacy | 4.2.6~dfsg-1ubuntu4.1 |
| npm | 3.5.2-0ubuntu4 |
| mongodb | 1:2.6.10-0ubuntu1 |

## Asennus ja käynnistys

```
npm install
node server.js
```

Avaa sovellus selaimessa osoitteessa http://localhost:8080. Palvelimen loki näkyy terminaalissa, josta `node server.js` on ajettu.

## Sovelluksen käyttö

### Käyttäjätilin luominen

Klikkaa **Rekisteröidy** ja syötä sähköpostiosoite ja salasana. Tämän jälkeen uusi käyttäjä kirjautuu automaattisesti sisään.

### Uuden laitteen lisääminen ja tietojen muokkaaminen

Aluksi laiteluettelo on tyhjä. Klikkaa **Lisää uusi laite**, syötä laitteen nimi ja kuvaus ja klikkaa **Tallenna**. Front-end sallii vain näiden kahden perustiedon syöttämisen; muiden osalta on käytettävä REST-API:a.

Klikkaa laitteen kohdalla olevaa **Muokkaa**-linkkiä. Popup-ruudun ylälaidassa näkyy laitteelle annettu *id*-tunniste, jonka avulla laitteen tietoja voi katsella ja muokata REST-API:n kautta. Tunnistetta klikkaamalla laitteen tiedot saadaan näkyviin JSON-muodossa uuteen selaimen välilehteen.

### Lopetus

Sulje sovellus **Kirjaudu ulos** -linkistä sivun ylälaidassa.

## REST-API

Tähdellä (\*) merkityt toiminnot vaativat järjestelmään kirjautumisen.

### Laitteiden hallinta

| toiminto | HTTP-verbi | URI | sisältö |
| --- | --- | --- | --- |
| Hae kaikki laitteet * | GET | `/gadgets` | `application/json` |
| Hae laite *id* * | GET | `/gadgets/<id>` | `application/json` |
| Tallenna uusi laite * | PUT | `/gadgets` | `application/json`<br>`{"name": <nimi>, "description": <kuvaus>}` |
| Päivitä laitteen tiedot * | PUT | `/gadgets/<id>` | `application/json`<br>(sisältää vain päivitettävät tiedot) |
| Poista laite *id* * | DELETE | `/gadgets/<id>` |  |
| Hae laitteen *id* ominaisuus *prop* | GET | `/gadgets/<id>/<prop>` | `text/plain` |
| Anna laitteelle *id* ominaisuus *prop* | PUT | `/gadgets/<id>/<prop>` | `text/plain` |
| Anna laitteelle *id* ominaisuus "location" | PUT | `/gadgets/<id>/location` | `application/json`<br>`{"lat": <leveyspiiri>, "lng": <pituuspiiri>}` |

### Käyttäjien ja istuntojen hallinta

| toiminto | HTTP-verbi | URI | sisältö |
| --- | --- | --- | --- |
| Luo uusi käyttäjätili | PUT | `/users` | `application/json`<br>`{"email": <sähköposti>, "passwordSHA256": <salasanatiiviste>}` |
| Kirjaa käyttäjä sisään | POST | `/session` | `application/json`<br>`{"email": <sähköposti>, "passwordSHA256": <salasanatiiviste>}` |
| Kirjaa käyttäjä ulos * | DELETE | `/session` |  |

### Esimerkkejä

REST-API-toimintoja voi suorittaa esimerkiksi `curl`:lla tai [Postmanilla](https://www.getpostman.com/).

Laitteen värin asettaminen:
```
curl -X PUT -H "Content-Type: text/plain" -d 'blue' http://localhost:8080/gadgets/58023694191ca447dfb00ec7/color
```

Laitteen merkitseminen kartalle:
```
curl -X PUT -H "Content-Type: application/json" -d '{"lat":60.170638, "lng":24.941508}' http://localhost:8080/gadgets/58023694191ca447dfb00ec7/location
```
Koordinaattien tallentamisen jälkeen laiteluettelosivu täytyy päivittää selaimessa.

## Toteutetut ominaisuudet

1. Sovelluksella on selaimella käytettävä käyttöliittymä.
2. Esineitä voi luoda, lukea, päivittää ja poistaa (*Create, Read, Update, Delete = CRUD*).
3. Jokaisella esineellä on nimi ja kuvaus.
4. Esineisiin on mahdollista liittää myös WGS84-muotoinen sijaintitieto, jolloin ne saadaan näkymään Google-kartalla.
5. Näiden lisäksi esineille voi antaa rajattomasti muita ominaisuuksia.
6. Esineitä ja niiden ominaisuuksia voidaan käsitellä myös REST-API:n kautta.
7. Käyttäjätilit perustuvat sähköpostiosoitteeseen ja SHA-256-koodattuun salasanaan.

## Puutteet

1. Sijaintitietoa ei voi syöttää front-endin kautta. Tämä on tietoinen ratkaisu, koska IoT-laitteiden pitäisi osata itse ilmoittaa koordinaattinsa järjestelmälle. Staattisten laitteiden merkitseminen kartalle klikkaamalla olisi silti perusteltu toiminto.
2. Front-endissä ei voi lisätä ominaisuuksia esineisiin.
3. Ominaisuuksia ei voi poistaa.
4. Käyttäjätilit ovat oikeastaan hyödyttömiä, koska laitteet eivät ole käyttäjäkohtaisia. Järjestelmää voisi laajentaa siten, että jokainen käyttäjä näkee vain itse lisäämänsä laitteet.
5. Käyttöliittymän ergonomisuuteen ei ole juuri panostettu.
