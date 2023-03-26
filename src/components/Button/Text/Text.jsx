import React from 'react';
import './text.css';
import { Button } from 'antd';
function Text(props) {
  const { label } = props;
  return (
    <Button type="text" {...props} className="text-button-wrapper">
      {label}
    </Button>
  );
}

export default Text;
