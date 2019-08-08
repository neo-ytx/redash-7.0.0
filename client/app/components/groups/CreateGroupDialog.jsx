import React from 'react';
import Modal from 'antd/lib/modal';
import Input from 'antd/lib/input';
import { LocaleProvider } from 'antd';
import zhCN from 'antd/es/locale-provider/zh_CN';
import { wrap as wrapDialog, DialogPropType } from '@/components/DialogWrapper';
import { Group } from '@/services/group';

class CreateGroupDialog extends React.Component {
  static propTypes = {
    dialog: DialogPropType.isRequired,
  };

  state = {
    name: '',
  };

  save = () => {
    this.props.dialog.close(new Group({
      name: this.state.name,
    }));
  };

  render() {
    const { dialog } = this.props;
    return (
      <LocaleProvider locale={zhCN}>
        <Modal {...dialog.props} title="创建新的组" okText="创建" onOk={() => this.save()}>
          <Input
            className="form-control"
            defaultValue={this.state.name}
            onChange={event => this.setState({ name: event.target.value })}
            onPressEnter={() => this.save()}
            placeholder="组名"
            autoFocus
          />
        </Modal>
      </LocaleProvider>
    );
  }
}

export default wrapDialog(CreateGroupDialog);
