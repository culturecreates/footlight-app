import React from 'react';
import { Button } from 'antd';
import './smallButton.css';

const SmallButton = (props) => {
  const { label } = props;
  return (
    <div className="small-button-wrapper" {...props}>
      <Button>{label}</Button>
    </div>
  );
};

export default SmallButton;
