var gadgetsApp = angular.module('gadgetsApp', []);

var uriGadgets = '/gadgets';
var uriSession = '/session';

gadgetsApp.controller('gadgetsController', ($scope, $http, $timeout, $window) => {

  $http.get(uriSession).success(function(res) {

    $scope.userEmail = res;
  });

  /* Luettelosivun avaaminen */

  $http.get(uriGadgets).then(function(res) {

    /* Tallennetaan Expressin lähettämä JSON-lista. */

    $scope.gadgets = res.data;

    /* Lisätään yksi tyhjä alkio uuden laitteen lisäämistä varten. */

    $scope.gadgetEmpty = {
      _id: '',
      name: 'Mysteerimasiina',
      description: 'Iskee, kun sitä vähiten odotetaan'
    };

    $scope.gadgets.push($scope.gadgetEmpty);
  });

  /* Muokkausnäkymän avaaminen ja sulkeminen */

  $scope.openEditor = (g) => {

    /* $scope.gThis sisältää uuden tai muokattavan laitteen tiedot. */

    if (!g._id) {
      $scope.gThis = {
        name: '',
        description: ''
        /*,
        location: {
          lat: 0,
          lng: 0
        }*/
      };
    }
    else {
      $scope.gThis = {
        name: g.name,
        description: g.description
      };
      /*
      if (g.location) {
        $scope.gThis.location = {
          lat: g.location.lat,
          lng: g.location.lng
        };
      }
      */
      if (g.extra) {
        $scope.gThis.extra = {};
        for (var attr in g.extra) {
          $scope.gThis.extra[attr] = g.extra[attr];
        }
      }
    }

    document.getElementById('edit_' + g._id).style.visibility = 'visible';
  }

  $scope.closeEditor = (g) => {

    document.getElementById('edit_' + g._id).style.visibility = 'hidden';
  }

  /* PUT lisää uuden laitteen tai muokkaa olemassa olevan laitteen tietoja. */

  $scope.editGadget = (g) => {

    if (!g._id) {

      /* Uuden lisäys. Palvelin palauttaa _id:n HTTP-statusviestinä. */

      if ($scope.gThis.name && $scope.gThis.description) {

        $http.put(uriGadgets, $scope.gThis).then(function(res) {
          $scope.gThis._id = res.data;
          $scope.gadgets.push($scope.gThis);
        });

        $scope.closeEditor(g);
      }
    }
    else {

      /* Vanhan muokkaus. Päivitetään vain ne tiedot, joita on muutettu. */

      if ($scope.gThis.name == g.name)
        delete $scope.gThis.name;
      else
        g.name = $scope.gThis.name;

      if ($scope.gThis.description == g.description)
        delete $scope.gThis.description;
      else
        g.description = $scope.gThis.description;

      /*
      if (g.location) {
        if ($scope.gThis.location.lat == g.location.lat &&
            $scope.gThis.location.lng == g.location.lng) {
          delete $scope.gThis.location;
        }
        else {
          g.location.lat = $scope.gThis.location.lat;
          g.location.lng = $scope.gThis.location.lng;
        }
      }
      */

      if (g.extra) {
        var deleteExtra = true;
        for (var attr in g.extra) {
          if ($scope.gThis.extra[attr] != g.extra[attr]) {
            g.extra[attr] = $scope.gThis.extra[attr];
            deleteExtra = false;
          }
        }
        if (deleteExtra) {
          delete $scope.gThis.extra;
        }
      }

      /* Ei tehdä mitään, ellei muutoksia ole tehty. */

      if (Object.getOwnPropertyNames($scope.gThis).length > 0) {
        $http.put(uriGadgets + '/' + g._id, $scope.gThis);
      }

      $scope.closeEditor(g);
    }
  }

  /* DELETE poistaa laitteen. */

  $scope.deleteGadget = (g) => {

    if ($window.confirm('Poistetaanko "' + g.name + '"?')) {

      $http.delete(uriGadgets + '/' + g._id);

      /* Poistetaan karttamerkki. */

      $scope.markers.forEach(function(sm) {
        if (sm.gadgetId == g._id)
          sm.setMap(null);
      });

      /* Poistetaan laite $scope.gadgets:sta. */

      var gIndex = $scope.gadgets.indexOf(g);
      if (gIndex > -1) {
        $scope.gadgets.splice(gIndex, 1);
      }
    }
  }

  /* Karttamerkkien lisääminen kartalle */

  $scope.initMarkers = function() {

    $scope.markers = [];

    if ($scope.gadgets != undefined) {

      var centerMarker;

      $scope.gadgets.forEach(function(sg) {

        if (sg.location) {
          $scope.markers.push(new google.maps.Marker({
            position: sg.location,
            map: $scope.map,
            title: sg.name,
            gadgetId: sg._id
          }));
          if (centerMarker == undefined) {
            centerMarker = sg.location;
          }
        }
      });

      $scope.map.setCenter(centerMarker ||
        { lat: 60.170638, lng: 24.941508 }
      );
    }
    else {

      $timeout(function() {
        $scope.initMarkers();
      }, 1000);
    }
  }

  /* Uloskirjautuminen */

  $scope.logoutUser = () => {

    /* Tarkistetaan salasana ja avataan istunto. */

    $http.delete(uriSession).success(function(res) {

      /* Istunto on suljettu, joten palataan kirjautumissivulle. */

      $window.location.reload();

    });
  }
});

/* Google-kartan alustus */

function initMap() {

  map = new google.maps.Map(document.getElementById('map'), {
    streetViewControl: false,
    zoom: 14
  });

  mapScope = angular.element(document.getElementById('angularBody')).scope();

  mapScope.map = map;
  mapScope.initMarkers();

};
