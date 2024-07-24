import React from 'react';
import { Checkbox } from 'antd';
import './checkBox.css';

function CheckBox(props) {
  const { label } = props;
  return (
    <Checkbox {...props} className="checkbox-styled">
      {label}
    </Checkbox>
  );
}

export default CheckBox;
