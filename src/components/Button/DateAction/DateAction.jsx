import React from 'react';
import { Button } from 'antd';
import { CalendarOutlined } from '@ant-design/icons';
import './dateAction.css';

function DateAction(props) {
  return (
    <Button className="date-action-button" type="default" {...props}>
      <div className="date-action-button-icon">
        <CalendarOutlined />
      </div>
      <div className="date-action-button-label">{props.label}</div>
    </Button>
  );
}

export default DateAction;
