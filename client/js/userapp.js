var usersApp = angular.module('usersApp', []);

var uriUsers = '/users';
var uriSession = '/session';

usersApp.controller('usersController', ($scope, $http, $window) => {

  /* Tekstikenttien tyhjennys */

  $scope.clearLoginPopup = () => {
    $scope.email = '';
    $scope.password = '';
    document.getElementById('loginFailureMessage').style.display = 'none';
  }

  $scope.clearLoginPopup();

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

      /* Lasketaan salasanan SHA256-tiiviste. */

      var loginAttempt = {
        email: $scope.email,
        passwordSHA256: $scope.password
      };

      /* Tarkistetaan salasana ja avataan istunto. */

      $http.post(uriSession, loginAttempt).success(function(res) {

        /* Istunto on avattu, joten ladataan sama URI uudelleen. */

        $window.location.reload();

      }).error(function (res) {

        document.getElementById('loginFailureMessage').style.display = 'block';

      });

    }
  }
});
