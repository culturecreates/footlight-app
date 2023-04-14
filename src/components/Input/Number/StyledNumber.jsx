import React from 'react';
import './styledNumber.css';
import { InputNumber } from 'antd';

function StyledNumber(props) {
  return <InputNumber {...props} size="large" className="form-item-number-input" />;
}

export default StyledNumber;
