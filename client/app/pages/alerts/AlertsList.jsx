import React from 'react';
import { react2angular } from 'react2angular';

import { toUpper } from 'lodash';
import { PageHeader } from '@/components/PageHeader';
import { Paginator } from '@/components/Paginator';
import { EmptyState } from '@/components/empty-state/EmptyState';

import { wrap as liveItemsList, ControllerType } from '@/components/items-list/ItemsList';
import { ResourceItemsSource } from '@/components/items-list/classes/ItemsSource';
import { StateStorage } from '@/components/items-list/classes/StateStorage';

import LoadingState from '@/components/items-list/components/LoadingState';
import ItemsTable, { Columns } from '@/components/items-list/components/ItemsTable';

import { Alert } from '@/services/alert';
import { routesToAngularRoutes } from '@/lib/utils';

const STATE_CLASS = {
  unknown: 'label-warning',
  ok: 'label-success',
  triggered: 'label-danger',
};

class AlertsList extends React.Component {
  static propTypes = {
    controller: ControllerType.isRequired,
  };

  listColumns = [
    Columns.custom.sortable((text, alert) => (
      <div>
        <a className="table-main-title" href={'alerts/' + alert.id}>{alert.name}</a>
      </div>
    ), {
      title: '名称',
      field: 'name',
    }),
    Columns.custom.sortable((text, alert) => (
      <div>
        <span className={`label ${STATE_CLASS[alert.state]}`}>{toUpper(alert.state)}</span>
      </div>
    ), {
      title: '状态',
      field: 'state',
      width: '6%',
    }),
    Columns.timeAgo.sortable({ title: '上次更新于',
      field: 'updated_at',
      className: 'text-nowrap',
      width: '1%' }),
    Columns.avatar({ field: 'user', className: 'p-l-0 p-r-0' }, name => `由 ${name} 创建`),
    Columns.dateTime.sortable({ title: '创建于',
      field: 'created_at',
      className: 'text-nowrap',
      width: '1%' }),
  ];

  render() {
    const { controller } = this.props;

    return (
      <div className="container">
        <PageHeader title={controller.params.title} />
        <div className="m-l-15 m-r-15">
          {!controller.isLoaded && <LoadingState className="" />}
          {controller.isLoaded && controller.isEmpty && (
            <EmptyState
              icon="fa fa-bell-o"
              illustration="alert"
              description="获得有关某些事件的通知。"
              helpLink="https://redash.io/help/user-guide/alerts/"
              showAlertStep
            />
          )}
          {
            controller.isLoaded && !controller.isEmpty && (
              <div className="table-responsive bg-white tiled">
                <ItemsTable
                  items={controller.pageItems}
                  columns={this.listColumns}
                  orderByField={controller.orderByField}
                  orderByReverse={controller.orderByReverse}
                  toggleSorting={controller.toggleSorting}
                />
                <Paginator
                  totalCount={controller.totalItemsCount}
                  itemsPerPage={controller.itemsPerPage}
                  page={controller.page}
                  onChange={page => controller.updatePagination({ page })}
                />
              </div>
            )
          }
        </div>
      </div>
    );
  }
}

export default function init(ngModule) {
  ngModule.component('pageAlertsList', react2angular(liveItemsList(
    AlertsList,
    new ResourceItemsSource({
      isPlainList: true,
      getRequest() {
        return {};
      },
      getResource() {
        return Alert.query.bind(Alert);
      },
      getItemProcessor() {
        return (item => new Alert(item));
      },
    }),
    new StateStorage({ orderByField: 'created_at', orderByReverse: true, itemsPerPage: 20 }),
  )));
  return routesToAngularRoutes([
    {
      path: '/alerts',
      title: '警报',
      key: 'alerts',
    },
  ], {
    reloadOnSearch: false,
    template: '<page-alerts-list on-error="handleError"></page-alerts-list>',
    controller($scope, $exceptionHandler) {
      'ngInject';

      $scope.handleError = $exceptionHandler;
    },
  });
}

init.init = true;
