import { find } from 'lodash';
import debug from 'debug';
import template from './show.html';

const logger = debug('redash:http');
export const deleteConfirm = { class: 'btn-warning', title: '删除' };
export function logAndToastrError(deleteObject, httpResponse, toastr) {
  logger('Failed to delete ' + deleteObject + ': ', httpResponse.status, httpResponse.statusText, httpResponse.data);
  toastr.error('删除失败 ' + deleteObject + '.');
}
export function toastrSuccessAndPath(deleteObject, deletePath, toastr, $location) {
  toastr.success(deleteObject + ' 删除成功。');
  $location.path('/' + deletePath + '/');
}

function DataSourceCtrl(
  $scope, $route, $routeParams, $http, $location, toastr,
  currentUser, AlertDialog, DataSource,
) {
  $scope.dataSource = $route.current.locals.dataSource;
  $scope.dataSourceId = $routeParams.dataSourceId;
  $scope.types = $route.current.locals.types;
  $scope.type = find($scope.types, { type: $scope.dataSource.type });
  $scope.canChangeType = $scope.dataSource.id === undefined;

  $scope.helpLinks = {
    athena: 'https://redash.io/help/data-sources/amazon-athena-setup',
    bigquery: 'https://redash.io/help/data-sources/bigquery-setup',
    url: 'https://redash.io/help/data-sources/querying-urls',
    mongodb: 'https://redash.io/help/data-sources/mongodb-setup',
    google_spreadsheets: 'https://redash.io/help/data-sources/querying-a-google-spreadsheet',
    google_analytics: 'https://redash.io/help/data-sources/google-analytics-setup',
    axibasetsd: 'https://redash.io/help/data-sources/axibase-time-series-database',
    results: 'https://redash.io/help/user-guide/querying/query-results-data-source',
  };

  $scope.$watch('dataSource.id', (id) => {
    if (id !== $scope.dataSourceId && id !== undefined) {
      $location.path(`/data_sources/${id}`).replace();
    }
  });

  $scope.setType = (type) => {
    $scope.type = type;
    $scope.dataSource.type = type.type;
  };

  $scope.resetType = () => {
    $scope.type = undefined;
    $scope.dataSource = new DataSource({ options: {} });
  };

  function deleteDataSource(callback) {
    const doDelete = () => {
      $scope.dataSource.$delete(() => {
        toastrSuccessAndPath('Data source', 'data_sources', toastr, $location);
      }, (httpResponse) => {
        logAndToastrError('data source', httpResponse, toastr);
      });
    };

    const deleteTitle = '删除该数据源';
    const deleteMessage = `你确定要删除数据源 "${$scope.dataSource.name}" 吗？`;

    AlertDialog.open(deleteTitle, deleteMessage, deleteConfirm).then(doDelete, callback);
  }

  function testConnection(callback) {
    DataSource.test({ id: $scope.dataSource.id }, (httpResponse) => {
      if (httpResponse.ok) {
        toastr.success('成功');
      } else {
        toastr.error(httpResponse.message, '连接测试失败：', { timeOut: 10000 });
      }
      callback();
    }, (httpResponse) => {
      logger('Failed to test data source: ', httpResponse.status, httpResponse.statusText, httpResponse);
      toastr.error('执行连接测试时发生未知错误。请稍后再试。', '连接测试失败：', { timeOut: 10000 });
      callback();
    });
  }

  $scope.actions = [
    { name: '删除', type: 'danger', callback: deleteDataSource },
    {
      name: '测试连接', pullRight: true, callback: testConnection, disableWhenDirty: true,
    },
  ];
}

export default function init(ngModule) {
  ngModule.controller('DataSourceCtrl', DataSourceCtrl);

  return {
    '/data_sources/new': {
      template,
      controller: 'DataSourceCtrl',
      title: 'Datasources',
      resolve: {
        dataSource: (DataSource) => {
          'ngInject';

          return new DataSource({ options: {} });
        },
        types: ($http) => {
          'ngInject';

          return $http.get('api/data_sources/types').then(response => response.data);
        },
      },
    },
    '/data_sources/:dataSourceId': {
      template,
      controller: 'DataSourceCtrl',
      title: 'Datasources',
      resolve: {
        dataSource: (DataSource, $route) => {
          'ngInject';

          return DataSource.get({ id: $route.current.params.dataSourceId }).$promise;
        },
        types: ($http) => {
          'ngInject';

          return $http.get('api/data_sources/types').then(response => response.data);
        },
      },
    },
  };
}

init.init = true;
