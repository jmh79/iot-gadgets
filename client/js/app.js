var gadgetsApp = angular.module('gadgetsApp', []);

var uriGadgets = '/gadgets';
var uriGadgetsNew = uriGadgets + '/new';
var uriEdit = '/edit';

gadgetsApp.controller('gadgetsController', ($scope, $http, $timeout, $window) => {

  /* Luettelosivun avaaminen */
  $http.get(uriGadgets).then(function(res) {
    $scope.gadgets = res.data;
    $scope.selectedGadget = null;
  });

  /* Muokkausnäkymän avaaminen ja sulkeminen */

  $scope.openEditor = (g) => {
    document.getElementById('edit_' + g._id).style.visibility = 'visible';
  }

  $scope.closeEditor = (g) => {
    document.getElementById('edit_' + g._id).style.visibility = 'hidden';
  }

  /* PUT lisää uuden laitteen. */

  $scope.addGadget = (newName, newDesc) => {
    $http.put(uriGadgetsNew, {
      name: newName,
      description: newDesc
    });
    /* Palataan luettelosivulle. */
    $window.location = '/';
  }

  /* PUT muokkaa olemassa olevan laitteen tietoja. */

  $scope.editGadget = (g) => {
    //$http.put(uriGadgets + '/' + g._id, g);
    $scope.closeEditor(g);
    console.log(g);
  }

  /* DELETE poistaa laitteen. */

  $scope.deleteGadget = (g) => {
    if (window.confirm('Poistetaanko "' + g.name + '"?')) {
      $http.delete(uriGadgets + '/' + g._id);
      /* Poistetaan laite myös $scope.gadgets:sta. */
      var gIndex = $scope.gadgets.indexOf(g);
      if (gIndex > -1) {
        $scope.gadgets.splice(gIndex, 1);
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
