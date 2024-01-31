import React from 'react';
import './styledNumber.css';
import { InputNumber } from 'antd';
import i18n from 'i18next';

function StyledNumber(props) {
  return (
    <InputNumber
      {...props}
      className="form-item-number-input"
      size="large"
      decimalSeparator={i18n?.language === 'fr' ? ',' : '.'}
      precision={2}
    />
  );
}

export default StyledNumber;
