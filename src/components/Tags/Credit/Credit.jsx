import React from 'react';
import './creditTag.css';
import { Tag } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';

function Credit(props) {
  return (
    <Tag
      {...props}
      color={props?.color ?? '#EFF2FF'}
      className="credit-tags-wrapper"
      icon={<CheckCircleOutlined style={{ color: '#0f0e98' }} />}>
      {props.children}
    </Tag>
  );
}

export default Credit;
