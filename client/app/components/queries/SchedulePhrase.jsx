import { react2angular } from 'react2angular';
import React from 'react';
import PropTypes from 'prop-types';
import Tooltip from 'antd/lib/tooltip';
import { localizeTime, durationHumanize } from '@/filters';
import { RefreshScheduleType, RefreshScheduleDefault } from '../proptypes';

import './ScheduleDialog.css';

export class SchedulePhrase extends React.Component {
  static propTypes = {
    schedule: RefreshScheduleType,
    isNew: PropTypes.bool.isRequired,
    isLink: PropTypes.bool,
  };

  static defaultProps = {
    schedule: RefreshScheduleDefault,
    isLink: false,
  };

  get content() {
    const { interval: seconds } = this.props.schedule || SchedulePhrase.defaultProps.schedule;
    if (!seconds) {
      return ['从不'];
    }
    const humanized = durationHumanize(seconds, {
      omitSingleValueNumber: true,
    });
    const short = `每 ${humanized}`;
    let full = `刷新 每 ${humanized}`;

    const { time, day_of_week: dayOfWeek } = this.props.schedule;
    if (time) {
      full += ` 在 ${localizeTime(time)}`;
    }
    if (dayOfWeek) {
      full += ` 在 ${dayOfWeek}`;
    }

    return [short, full];
  }

  render() {
    if (this.props.isNew) {
      return '从不';
    }

    const [short, full] = this.content;
    const content = full ? <Tooltip title={full}>{short}</Tooltip> : short;

    return this.props.isLink
      ? <a className="schedule-phrase">{content}</a>
      : content;
  }
}

export default function init(ngModule) {
  ngModule.component('schedulePhrase', react2angular(SchedulePhrase));
}

init.init = true;
