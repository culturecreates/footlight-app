import { Spin } from 'antd';
import React from 'react';
import { LoadingOutlined } from '@ant-design/icons';

function LoadingIndicator(props) {
  return (
    <Spin
      size="large"
      indicator={<LoadingOutlined style={{ fontSize: 32, color: 'rgb(27, 61, 230)' }} spin />}
      {...props}
    />
  );
}

export default LoadingIndicator;
