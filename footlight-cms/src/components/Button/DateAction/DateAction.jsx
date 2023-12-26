import React from 'react';
import { Button } from 'antd';
import './dateAction.css';

function DateAction(props) {
  const { iconrender, label } = props;
  return (
    <Button className="date-action-button" type="default" {...props}>
      <div className="date-action-button-icon">{iconrender}</div>
      <div className="date-action-button-label">{label}</div>
    </Button>
  );
}

export default DateAction;
