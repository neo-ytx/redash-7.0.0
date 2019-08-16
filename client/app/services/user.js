import { isString } from 'lodash';
import { $http, $sanitize, toastr } from '@/services/ng';
import { clientConfig } from '@/services/auth';

export let User = null; // eslint-disable-line import/no-mutable-exports

function disableResource(user) {
  return `api/users/${user.id}/disable`;
}

function enableUser(user) {
  const userName = $sanitize(user.name);

  return $http
    .delete(disableResource(user))
    .then((data) => {
      toastr.success(`用户 <b>${userName}</b> 现已启用。`, { allowHtml: true });
      user.is_disabled = false;
      user.profile_image_url = data.data.profile_image_url;
      return data;
    })
    .catch((response) => {
      let message = response instanceof Error ? response.message : response.statusText;
      if (!isString(message)) {
        message = '未知错误';
      }
      toastr.error(`无法启用用户 <b>${userName}</b><br>${message}`, { allowHtml: true });
    });
}

function disableUser(user) {
  const userName = $sanitize(user.name);
  return $http
    .post(disableResource(user))
    .then((data) => {
      toastr.warning(`用户 <b>${userName}</b> 现在被禁用。`, { allowHtml: true });
      user.is_disabled = true;
      user.profile_image_url = data.data.profile_image_url;
      return data;
    })
    .catch((response = {}) => {
      const message =
        response.data && response.data.message
          ? response.data.message
          : `无法禁用用户 <b>${userName}</b><br>${response.statusText}`;

      toastr.error(message, { allowHtml: true });
    });
}

function deleteUser(user) {
  const userName = $sanitize(user.name);
  return $http
    .delete(`api/users/${user.id}`)
    .then((data) => {
      toastr.warning(`用户 <b>${userName}</b> 已经被删除。`, { allowHtml: true });
      return data;
    })
    .catch((response = {}) => {
      const message =
        response.data && response.data.message
          ? response.data.message
          : `无法删除用户 <b>${userName}</b><br>${response.statusText}`;

      toastr.error(message, { allowHtml: true });
    });
}

function convertUserInfo(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    profileImageUrl: user.profile_image_url,
    apiKey: user.api_key,
    isDisabled: user.is_disabled,
    isInvitationPending: user.is_invitation_pending,
  };
}

function regenerateApiKey(user) {
  return $http
    .post(`api/users/${user.id}/regenerate_api_key`)
    .then(({ data }) => {
      toastr.success(' API Key 已经被更新');
      return data.api_key;
    })
    .catch((response = {}) => {
      const message =
        response.data && response.data.message
          ? response.data.message
          : `重新生成 API Key 失败: ${response.statusText}`;

      toastr.error(message);
    });
}

function sendPasswordReset(user) {
  return $http
    .post(`api/users/${user.id}/reset_password`)
    .then(({ data }) => {
      if (clientConfig.mailSettingsMissing) {
        toastr.warning('未配置邮件服务器。');
        return data.reset_link;
      }
      toastr.success('密码重置电子邮件已发送。');
    })
    .catch((response = {}) => {
      const message =
        response.message
          ? response.message
          : `发送密码重置邮件失败: ${response.statusText}`;

      toastr.error(message);
    });
}

function resendInvitation(user) {
  return $http
    .post(`api/users/${user.id}/invite`)
    .then(({ data }) => {
      if (clientConfig.mailSettingsMissing) {
        toastr.warning('未配置邮件服务器。');
        return data.invite_link;
      }
      toastr.success('邀请已发送。');
    })
    .catch((response = {}) => {
      const message =
        response.message
          ? response.message
          : `重新发送邀请失败: ${response.statusText}`;

      toastr.error(message);
    });
}

function UserService($resource) {
  const actions = {
    get: { method: 'GET' },
    create: { method: 'POST' },
    save: { method: 'POST' },
    query: { method: 'GET', isArray: false },
    delete: { method: 'DELETE' },
    disable: { method: 'POST', url: 'api/users/:id/disable' },
    enable: { method: 'DELETE', url: 'api/users/:id/disable' },
  };

  const UserResource = $resource('api/users/:id', { id: '@id' }, actions);

  UserResource.enableUser = enableUser;
  UserResource.disableUser = disableUser;
  UserResource.deleteUser = deleteUser;
  UserResource.convertUserInfo = convertUserInfo;
  UserResource.regenerateApiKey = regenerateApiKey;
  UserResource.sendPasswordReset = sendPasswordReset;
  UserResource.resendInvitation = resendInvitation;

  return UserResource;
}

export default function init(ngModule) {
  ngModule.factory('User', UserService);

  ngModule.run(($injector) => {
    User = $injector.get('User');
  });
}

init.init = true;
