import { replace } from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import Switch from 'antd/lib/switch';
import Modal from 'antd/lib/modal';
import Form from 'antd/lib/form';
import Alert from 'antd/lib/alert';
import { $http, toastr } from '@/services/ng';
import { wrap as wrapDialog, DialogPropType } from '@/components/DialogWrapper';
import InputWithCopy from '@/components/InputWithCopy';
import { HelpTrigger } from '@/components/HelpTrigger';

const API_SHARE_URL = 'api/dashboards/{id}/share';

class ShareDashboardDialog extends React.Component {
  static propTypes = {
    dashboard: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    hasQueryParams: PropTypes.bool.isRequired,
    dialog: DialogPropType.isRequired,
  };

  formItemProps = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
    style: { marginBottom: 7 },
  }

  constructor(props) {
    super(props);
    const { dashboard } = this.props;

    this.state = {
      saving: false,
    };

    this.apiUrl = replace(API_SHARE_URL, '{id}', dashboard.id);
    this.disabled = this.props.hasQueryParams && !dashboard.publicAccessEnabled;
  }

  static get headerContent() {
    return (
      <React.Fragment>
        分享仪表板
        <div className="modal-header-desc">
          允许使用私密地址对此仪表板进行公共访问.{' '}
          <HelpTrigger type="SHARE_DASHBOARD" />
        </div>
      </React.Fragment>
    );
  }

  enableAccess = () => {
    const { dashboard } = this.props;
    this.setState({ saving: true });

    $http
      .post(this.apiUrl)
      .success((data) => {
        dashboard.publicAccessEnabled = true;
        dashboard.public_url = data.public_url;
      })
      .error(() => {
        toastr.error('无法打开此仪表板的共享');
      })
      .finally(() => {
        this.setState({ saving: false });
      });
  }

  disableAccess = () => {
    const { dashboard } = this.props;
    this.setState({ saving: true });

    $http
      .delete(this.apiUrl)
      .success(() => {
        dashboard.publicAccessEnabled = false;
        delete dashboard.public_url;
      })
      .error(() => {
        toastr.error('关闭此仪表板的共享失败');
      })
      .finally(() => {
        this.setState({ saving: false });
      });
  }

  onChange = (checked) => {
    if (checked) {
      this.enableAccess();
    } else {
      this.disableAccess();
    }
  };

  render() {
    const { dialog, dashboard } = this.props;

    return (
      <Modal
        {...dialog.props}
        title={this.constructor.headerContent}
        footer={null}
      >
        <Form layout="horizontal">
          {this.props.hasQueryParams && (
            <Form.Item>
              <Alert
                message="Sharing is currently not supported for dashboards containing queries with parameters."
                type="error"
              />
            </Form.Item>
          )}
          <Form.Item label="允许公共访问" {...this.formItemProps}>
            <Switch
              checked={dashboard.publicAccessEnabled}
              onChange={this.onChange}
              loading={this.state.saving}
              disabled={this.disabled}
            />
          </Form.Item>
          {dashboard.public_url && (
            <Form.Item label="私密地址" {...this.formItemProps}>
              <InputWithCopy value={dashboard.public_url} />
            </Form.Item>
          )}
        </Form>
      </Modal>
    );
  }
}

export default wrapDialog(ShareDashboardDialog);
