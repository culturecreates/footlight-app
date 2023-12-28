import React from 'react';
import { Button } from 'antd';
import './primary.css';

function Primary(props) {
  const { label } = props;
  return (
    <Button className="primary-button" shape="primary" {...props}>
      {label}
    </Button>
  );
}

export default Primary;
