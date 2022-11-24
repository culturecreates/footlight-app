import React from 'react';
import './eventNumber.css';
import { Tag } from 'antd';

function EventNumber(props) {
  return (
    <Tag {...props} color="#e8e8e8" className="event-number-tag">
      {props.label}&nbsp;events
    </Tag>
  );
}

export default EventNumber;
