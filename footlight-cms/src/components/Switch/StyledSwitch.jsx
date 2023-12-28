import React from 'react';
import './styledSwitch.css';
import { Switch } from 'antd';

function StyledSwitch(props) {
  return <Switch {...props} className="switch-wrapper" />;
}

export default StyledSwitch;
