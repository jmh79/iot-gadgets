var usersApp = angular.module('usersApp', []);

var uriUsers = '/users';

usersApp.controller('usersController', ($scope, $http, $window) => {

  /* Tekstikenttien tyhjennys */

  $scope.clearLoginPopup = () => {
    $scope.email = 'some@address.net';
    $scope.password = '12345678';
  }

  $scope.clearLoginPopup();

  console.log('loginPopup opened');

  /* Uuden käyttäjän rekisteröintiruudun avaaminen ja sulkeminen */

  $scope.openRegisterPopup = (g) => {

    document.getElementById('loginPopup').style.display = 'none';
    document.getElementById('registerPopup').style.display = 'block';
  }

  $scope.closeRegisterPopup = (g) => {

    document.getElementById('registerPopup').style.display = 'none';
    document.getElementById('loginPopup').style.display = 'block';
  }

  /* Sisäänkirjautuminen */

  $scope.loginUser = () => {

    if ($scope.email && $scope.password) {

      //console.log($scope.email + ', "' + $scope.password + '"');

      /* Tarkistetaan salasana. */

      /* Avataan istunto. */

      /* Ladataan sama URI uudelleen. */

      $window.location.reload();
    }
  }


});
