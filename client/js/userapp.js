var usersApp = angular.module('usersApp', []);

var uriUsers = '/users';
var uriSession = '/session';

usersApp.controller('usersController', ($scope, $http, $window) => {

  /* Tekstikenttien tyhjennys */

  $scope.clearLoginFields = () => {

    $scope.email = '';
    $scope.password = '';
    $scope.passwordAgain = '';

    document.getElementById('loginError').style.display = 'none';
    document.getElementById('registerError').style.display = 'none';
  }

  $scope.clearLoginFields();

  /* Uuden käyttäjän rekisteröintiruudun avaaminen ja sulkeminen */

  $scope.openRegisterPopup = (g) => {

    document.getElementById('loginPopup').style.display = 'none';
    document.getElementById('registerPopup').style.display = 'block';
    $scope.clearLoginFields();
  }

  $scope.closeRegisterPopup = (g) => {

    document.getElementById('registerPopup').style.display = 'none';
    document.getElementById('loginPopup').style.display = 'block';
    $scope.clearLoginFields();
  }

  /* Sisäänkirjautuminen */

  $scope.loginUser = () => {

    if ($scope.email && $scope.password) {

      /* Lasketaan salasanan SHA256-tiiviste. */

      var loginAttempt = {
        email: $scope.email,
        passwordSHA256: Sha256.hash($scope.password)
      };

      /* Tarkistetaan salasana ja avataan istunto. */

      $http.post(uriSession, loginAttempt).success(function(res) {

        /* Istunto on avattu, joten ladataan sama URI uudelleen. */

        $window.location.reload();

      }).error(function (res) {

        document.getElementById('loginError').style.display = 'block';

      });

    }
  }

  $scope.createUser = () => {

    if ($scope.email && $scope.password && $scope.passwordAgain) {

      if ($scope.password == $scope.passwordAgain) {

        /* Lasketaan salasanan SHA256-tiiviste. */

        var newUser = {
          email: $scope.email,
          passwordSHA256: Sha256.hash($scope.password)
        };

        /* Tallennetaan käyttäjä. */

        $http.put(uriUsers, newUser).success(function(res) {

          /* Tilin luominen onnistui, joten kirjaudutaan sisään. */

          $scope.loginUser();
          /*
          //$window.location.reload();
          $window.alert('Käyttäjätili luotu.');
          closeRegisterPopup();
          */

        });

      }
      else {

        document.getElementById('registerError').style.display = 'block';

      }
    }
  }

});
