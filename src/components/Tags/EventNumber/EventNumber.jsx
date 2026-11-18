import React from 'react';
import './eventNumber.css';
import { Tag } from 'antd';
import { pluralize } from '../../../utils/pluralise';
import { useTranslation } from 'react-i18next';

function EventNumber(props) {
  const { t } = useTranslation();

  return (
    <Tag {...props} color="#EFF2FF" className="event-number-tag">
      &nbsp;{pluralize(props.label, t('dashboard.events.list.event'))}
    </Tag>
  );
}

export default EventNumber;
