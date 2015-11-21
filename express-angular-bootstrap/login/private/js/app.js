// initial app, load required module
angular.module('app', [ 
  'ngRoute', 
  'ngResource', 
  'ngMessages',
  'ngAnimate', 
  'angular-storage', 
  'ui.bootstrap',
  'appDirectives',
  'appControllers',
  'appServices' ])

// configurate app 
.config(['$routeProvider', '$httpProvider', function($routeProvider, $httpProvider) {
  // set up route
  $routeProvider
    .when('/', { controller: 'HomeCtrl', templateUrl: 'templates/home.html' })
    .when('/login', { controller: 'LoginCtrl', templateUrl: 'templates/login.html' })
    .when('/users', { controller: 'UsersCtrl', templateUrl: 'templates/user-list.html' })
    .when('/users/edit/:id?', { controller: 'UserFormCtrl', templateUrl: 'templates/user-form.html' })
    .when('/users/:id', { controller: 'UserDetailCtrl', templateUrl: 'templates/user-detail.html' })
    .otherwise({ redirectTo: '/' });
  
  // inject http interceptor for login check
  $httpProvider.interceptors.push([ '$q', '$location', '$rootScope', function($q, $location, $rootScope) {
    return {
      'request': function(config) {
        config.headers =  config.headers || {};
        if ($rootScope.currentUser && $rootScope.currentUser.token) {
          config.headers.Authorization = 'Bearer ' + $rootScope.currentUser.token;
        }
        config.timeout = 15000;
        return config;
      },
      'responseError': function(response) {
        if (response.status === 401 || response.status === 403) {
          $location.path('/login');
        } else {
          alert(response.data.description || '[' + response.status + ']' + response.data);
        }
        return $q.reject(response);
      }
    };
  }]);
} ])

// startup
.run(['store', '$location', '$rootScope', 'Login', '$window', function(store, $location, $rootScope, Login, $window) {
  $rootScope.appTitle = "Hello world!";

  $rootScope.currentUser = Login.currentUser();
  if (!$rootScope.currentUser)
    $location.path('/login');

  $rootScope.signout = function() {
    Login.signout();
    delete $rootScope.currentUser;
    $location.path('/login');
  };

  $rootScope.back = function() {
    $window.history.back();
  };
}])
;
