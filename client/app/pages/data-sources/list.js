import settingsMenu from '@/services/settingsMenu';
import { policy } from '@/services/policy';
import template from './list.html';

function DataSourcesCtrl(DataSource) {
  this.policy = policy;
  this.dataSources = DataSource.query();
}

export default function init(ngModule) {
  settingsMenu.add({
    permission: 'admin',
    title: '数据源',
    path: 'data_sources',
    order: 1,
  });

  ngModule.component('dsListPage', {
    controller: DataSourcesCtrl,
    template,
  });

  return {
    '/data_sources': {
      template: '<ds-list-page></ds-list-page>',
      title: '数据源',
    },
  };
}

init.init = true;
