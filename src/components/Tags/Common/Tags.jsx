import React from 'react';
import './tags.css';
import { Tag } from 'antd';

function Tags(props) {
  return (
    <Tag {...props} color={props?.color ?? '#EFF2FF'} className="tags-wrapper">
      {props.children}
    </Tag>
  );
}

export default Tags;
