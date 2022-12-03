import React from 'react';
import { Drawer } from 'antd';
import './index';

function ResponsiveSidebar(props) {
  const onClose = () => {
    props.onClose();
  };
  return (
    <Drawer
      title="Basic Drawer"
      placement="right"
      closable={true}
      onClose={onClose}
      open={props.open}
      key="right"
      {...props}>
      <p>Some contents...</p>
      <p>Some contents...</p>
      <p>Some contents...</p>
    </Drawer>
  );
}

export default ResponsiveSidebar;
