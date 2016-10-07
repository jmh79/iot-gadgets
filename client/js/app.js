var gadgetsApp = angular.module('gadgetsApp', []);

gadgetsApp.controller('ListController', function ListController($scope, $http) {

  $http.get('/gadgets').then(function(response) {
    $scope.gadgets = response.data;
  });

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
      setTimeout(function() {
        $scope.initMarkers();
      }, 1000);
    }
  }
});

function initMap() {

  map = new google.maps.Map(document.getElementById('map'), {
    center: { lat: 61.169158, lng: 28.771011 },
    zoom: 12
  });

  mapScope = angular.element(document.getElementById('angularBody')).scope();

  mapScope.map = map;
  mapScope.initMarkers();

};
