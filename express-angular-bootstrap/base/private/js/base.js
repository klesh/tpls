/* this provide some common Controller/Resource functions makers
 * Like to deal with a list need search/loadMore functionalities.
 */
// prepare against long list control
function longListCtrl($scope, Resource) {
  // to be sent with query method
  $scope.params = Resource.params = Resource.params || {};
  // to keep listing page status.
  $scope.state = Resource.state = Resource.state || {};

  // load list into $scope.list and detect if there are more.
  function updateList(refresh, list) {
    $scope.loading = false;

    var last = _.last(list);
    if (list.length === Resource.limit && last) {
      $scope.params.lastId = last.id;
    } else {
      delete $scope.params.lastId;
    }
    // there are more if lastId presented.

    if (refresh) {
      $scope.list = list;
    } else {
      _.each(list, function(item) { $scope.list.push(item); });
    }
  }

  var refreshList = _.partial(updateList, true);
  var appendList = _.partial(updateList, false);

  // gather selected items and send their ids to server, removes them from list when success.
  $scope.removes = function() {
    var items = _.filter($scope.list, { selected: true });
    Resource.delete({ ids: _.map(items, 'id') }).$promise.then(function() {
      _.each(items, function(item) { _.pull($scope.list, item); }); // pull out one by one so animation can take place
    });
  };

  // load more data base on params.
  $scope.loadMore = function() {
    $scope.loading = true;
    Resource.query($scope.params).$promise.then(appendList);
  };

  // search by params
  $scope.doSearch = function() {
    delete $scope.params.lastId;
    Resource.query($scope.params).$promise.then(refreshList);
  };

  // watch search switch, reset the query params when it's off.
  $scope.$watch('state.search', function(newValue) {
    if (newValue === false) {
      $scope.params = Resource.params = {};
      $scope.doSearch();
    }
  });

  $scope.doSearch();
}

// regular detail logic
function detailCtrl($scope, $routeParams, Resource) {
  $scope.detail = Resource.get($routeParams);
}

// regular create/update logic
function formCtrl($scope, $routeParams, Resource) {
  $scope.detail = $routeParams.id ? Resource.get($routeParams) : new Resource();
  $scope.save = function() {
    $scope.detail.$save().then(function() {
      window.history.back();
    }, function(res) {
      $scope.error = res.data;
    });
  };
}
