import React from 'react';
import './outlined.css';
import { Button } from 'antd';

function Outlined(props) {
  const { label, children } = props;
  return (
    <Button className="outlined-button" shape="default" {...props}>
      <span className="outlined-label">{label}</span>
      {children}
    </Button>
  );
}

export default Outlined;
