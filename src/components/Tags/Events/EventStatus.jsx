import React from 'react';
import { Tag } from 'antd';
import './eventStatus.css';

function EventStatus(props) {
  return (
    <Tag {...props} className="event-status-tag">
      magenta
    </Tag>
  );
}

export default EventStatus;
