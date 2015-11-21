angular.module('appServices', [])

// environment variable setup
.factory('ENV', function() {
  return {
    baseUrl: '',
    apiUrl: '/api'
  };
})

// login service
.factory('Login', [ 'ENV', '$http', 'store', function(ENV, $http, store) {
  var resource = {
    captchaKey: function() {
      return $http.get(ENV.baseUrl + '/login/captcha');
    },
    authenticate: function(data) {
      return $http.post(ENV.baseUrl + '/login/authenticate', data).success(function(res) {
        if (res.token) {
          resource.currentUser(res);
        }
      });
    },
    currentUser: function(user) {
      if (arguments.length > 0) {
        store.set('currentUser', angular.toJson(user));
      } else {
        return angular.fromJson(store.get('currentUser') || 'null');
      }
    },
    signout: function() {
      store.remove('currentUser');
    }
  };

  return resource;
}])

// user service
.factory('User', [ 'ENV', '$resource', function(ENV, $resource) {
  var resource = $resource(ENV.apiUrl + '/users/:id');
  resource.limit = 50;
  return resource;
}])
;
