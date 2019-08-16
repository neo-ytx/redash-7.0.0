import { find } from 'lodash';
import template from './show.html';
import { deleteConfirm, logAndToastrError, toastrSuccessAndPath } from '../data-sources/show';

function DestinationCtrl(
  $scope, $route, $routeParams, $http, $location, toastr,
  currentUser, AlertDialog, Destination,
) {
  $scope.destination = $route.current.locals.destination;
  $scope.destinationId = $routeParams.destinationId;
  $scope.types = $route.current.locals.types;
  $scope.type = find($scope.types, { type: $scope.destination.type });
  $scope.canChangeType = $scope.destination.id === undefined;

  $scope.$watch('destination.id', (id) => {
    if (id !== $scope.destinationId && id !== undefined) {
      $location.path(`/destinations/${id}`).replace();
    }
  });

  $scope.setType = (type) => {
    $scope.type = type;
    $scope.destination.type = type.type;
  };

  $scope.resetType = () => {
    $scope.type = undefined;
    $scope.destination = new Destination({ options: {} });
  };

  function deleteDestination(callback) {
    const doDelete = () => {
      $scope.destination.$delete(() => {
        toastrSuccessAndPath('目标', 'destinations', toastr, $location);
      }, (httpResponse) => {
        logAndToastrError('目标', httpResponse, toastr);
      });
    };

    const title = '删除该目标';
    const message = `你确定要删除目标 "${$scope.destination.name}" 吗？`;

    AlertDialog.open(title, message, deleteConfirm).then(doDelete, callback);
  }

  $scope.actions = [
    { name: '删除', type: 'danger', callback: deleteDestination },
  ];
}

export default function init(ngModule) {
  ngModule.controller('DestinationCtrl', DestinationCtrl);

  return {
    '/destinations/new': {
      template,
      controller: 'DestinationCtrl',
      title: '所有目标',
      resolve: {
        destination: (Destination) => {
          'ngInject';

          return new Destination({ options: {} });
        },
        types: ($http) => {
          'ngInject';

          return $http.get('api/destinations/types').then(response => response.data);
        },
      },
    },
    '/destinations/:destinationId': {
      template,
      controller: 'DestinationCtrl',
      title: '所有目标',
      resolve: {
        destination: (Destination, $route) => {
          'ngInject';

          return Destination.get({ id: $route.current.params.destinationId }).$promise;
        },
        types: ($http) => {
          'ngInject';

          return $http.get('api/destinations/types').then(response => response.data);
        },
      },
    },
  };
}

init.init = true;
