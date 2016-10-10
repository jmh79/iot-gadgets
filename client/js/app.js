var gadgetsApp = angular.module('gadgetsApp', []);

var uriGadgets = '/gadgets';

gadgetsApp.controller('ListController', function ListController($scope, $http, $timeout) {

  /* GET hakee laitteet. */

  $http.get('/gadgets').then(function(res) {
    $scope.gadgets = res.data;
  });

  /* PUT lisää uuden laitteen. */

  $scope.addGadget = (newName, newDesc) => {
    //console.log(newName + ":", newDesc);
    $http.put('/gadgets/new', {
      name: newName,
      description: newDesc
    });
  }

  /* PUT muokkaa olemassa olevan laitteen tietoja. */

  $scope.editGadget = (g) => {
    $http.put('/gadgets/' + g._id, g)
    /*
    .then(function(res) {
      console.log('id =', id);
      console.log('res =', res);
    })
    */
    ;
  }

  /* Lisätään karttamerkit kartalle. */

  $scope.markers = [];

  $scope.initMarkers = function() {
    if ($scope.gadgets != undefined) {
      $scope.gadgets.forEach(function(g) {
        $scope.markers.push(new google.maps.Marker({
          position: g.location,
          map: $scope.map,
          title: g.name
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
