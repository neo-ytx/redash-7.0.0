import React from 'react';
import PropTypes from 'prop-types';
import { react2angular } from 'react2angular';
import { currentUser, clientConfig } from '@/services/auth';

export function EmailSettingsWarning({ featureName }) {
  return (clientConfig.mailSettingsMissing && currentUser.isAdmin) ? (
    <p className="alert alert-danger">
      {`看起来您的邮件服务器未配置。 确保将其配置为${featureName}正常工作。`}
    </p>
  ) : null;
}

EmailSettingsWarning.propTypes = {
  featureName: PropTypes.string.isRequired,
};

export default function init(ngModule) {
  ngModule.component('emailSettingsWarning', react2angular(EmailSettingsWarning));
}

init.init = true;
