import React from 'react';
import { Button } from 'antd';
import './dateAction.css';

function DateAction(props) {
  const { iconRender, label } = props;
  return (
    <Button className="date-action-button" type="default" {...props}>
      <div className="date-action-button-icon">{iconRender}</div>
      <div className="date-action-button-label">{label}</div>
    </Button>
  );
}

export default DateAction;
