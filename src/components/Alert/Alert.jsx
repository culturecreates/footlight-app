import React from 'react';
import { Alert } from 'antd';
import './alert.css';

function StyledAlert(props) {
  return <Alert {...props} className={`alert-wrapper ${props.additionalClassName}`} />;
}

export default StyledAlert;
