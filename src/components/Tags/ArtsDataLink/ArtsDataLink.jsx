import React from 'react';
import './artsDataLink.css';
import { Tag } from 'antd';

function ArtsDataLink(props) {
  const { children } = props;
  return (
    <Tag {...props} className="artsdata-tag-wrapper">
      {children}
    </Tag>
  );
}

export default ArtsDataLink;
