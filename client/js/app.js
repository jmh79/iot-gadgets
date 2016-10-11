var gadgetsApp = angular.module('gadgetsApp', []);

var uriGadgets = '/gadgets';
var uriGadgetsNew = uriGadgets + '/new';
var uriEdit = '/edit';

gadgetsApp.controller('gadgetsController', ($scope, $http, $timeout, $window) => {

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

    /* Uutta laitetta lisättäessä tekstikentät on tyhjennettävä. */

    if (!g._id) {
      g.name = '';
      g.description = '';
    }

    document.getElementById('edit_' + g._id).style.visibility = 'visible';
  }

  $scope.closeEditor = (g) => {

    document.getElementById('edit_' + g._id).style.visibility = 'hidden';
  }

  /* PUT lisää uuden laitteen tai muokkaa olemassa olevan laitteen tietoja. */

  $scope.editGadget = (g) => {

    console.log(g);

    if (!g._id) {

      /* Uuden lisäys */

      var gadgetNew = {
        name: g.name,
        description: g.description
      }

      /* Palvelin palauttaa HTTP-statusviestinä laitteen _id:n. */

      $http.put(uriGadgetsNew, gadgetNew).then(function(res) {
        gadgetNew._id = res.data;
        $scope.gadgets.push(gadgetNew);
      });

    }
    else {

      /* Vanhan muokkaus */

      $http.put(uriGadgets + '/' + g._id, g);
    }

    $scope.closeEditor(g);
  }

  /* DELETE poistaa laitteen. */

  $scope.deleteGadget = (g) => {

    if (window.confirm('Poistetaanko "' + g.name + '"?')) {

      $http.delete(uriGadgets + '/' + g._id);

      /* Poistetaan laite myös $scope.gadgets:sta. */

      var gIndex = $scope.gadgets.indexOf(g);
      if (gIndex > -1) {
        $scope.gadgets.splice(gIndex, 1);
        /**** TODO: karttamerkit päivitettävä myös ****/
      }
    }
  }

  /* Lisätään karttamerkit kartalle. */

  $scope.markers = [];

  $scope.initMarkers = function() {

    if ($scope.gadgets != undefined) {

      $scope.gadgets.forEach(function(sg) {
        $scope.markers.push(new google.maps.Marker({
          position: sg.location,
          map: $scope.map,
          title: sg.name
        }));
      });
    }
    else {

      $timeout(function() {
        $scope.initMarkers();
      }, 1000);
    }
  }

});

/* Google-kartan alustus */

function initMap() {

  map = new google.maps.Map(document.getElementById('map'), {
    center: { lat: 61.169158, lng: 28.771011 },
    zoom: 14
  });

  mapScope = angular.element(document.getElementById('angularBody')).scope();

  mapScope.map = map;
  mapScope.initMarkers();

};
