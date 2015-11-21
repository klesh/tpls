angular.module('appControllers', [])

// login controller: to provider a cookieless token base login mechanism
.controller('LoginCtrl', ['ENV', '$rootScope', '$scope', '$location', 'Login', function(ENV, $rootScope, $scope, $location, Login) {

  // since it's token base, we need to shake out a random captcha key in order to verify the code.
  function loadCaptchaImage() {
    $scope.captchaSrc = '';
    Login.captchaKey().success(function(res) {
      $scope.captchaSrc = ENV.baseUrl + '/login/captcha/' + res.captchaKey;
      $scope.data.captchaKey = res.captchaKey;
    });
  }


  // submit login info to server.
  function authenticate() {
    Login.authenticate($scope.data).success(function() {
      $rootScope.currentUser = Login.currentUser();
      $location.path('/');
    }).error(function(err) {
      loadCaptchaImage();
      $scope.error = err;
    });
  }

  $scope.data = {};
  $scope.loadCaptchaImage = loadCaptchaImage;
  $scope.authenticate = authenticate;

  $rootScope.signout();
  loadCaptchaImage();
}])

.controller('MeCtrl', ['$scope', 'User', function($scope, User) {
  $scope.me = {
    account: store.get('account'),
    id: store.get('user_id'),
    logonAt: store.get('logonAt')
  };

  $scope.changePassword = function() {
    User.passwd({ id: $scope.me.id, password: $scope.newPass });
  };
}])

.controller('HomeCtrl', [function() {
  
}])

.controller('UsersCtrl', ['$scope', 'User', longListCtrl])
.controller('UserDetailCtrl', ['$scope', '$routeParams', 'User', detailCtrl])
.controller('UserFormCtrl', ['$scope', '$routeParams', 'User', formCtrl])
;
