import React from 'react';
import './selectOption.css';
import { Select } from 'antd';

function SelectOption(props) {
  return <Select className="select-wrapper" size="large" {...props} popupClassName="select-wrapper-dropdown" />;
}

export default SelectOption;
