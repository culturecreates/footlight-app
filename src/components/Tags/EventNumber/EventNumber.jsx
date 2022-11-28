import React from 'react';
import './eventNumber.css';
import { Tag } from 'antd';
import { pluralize } from '../../../utils/pluralise';

function EventNumber(props) {
  return (
    <Tag {...props} color="#e8e8e8" className="event-number-tag">
      &nbsp;{pluralize(props.label, 'event')}
    </Tag>
  );
}

export default EventNumber;
