import { Popover } from 'antd';
import React, { forwardRef, cloneElement } from 'react';

const CustomPopover = forwardRef(function CustomPopover({ children, ...props }, ref) {
  const childrenWithRef = cloneElement(children, { ...children.props, ref });
  return <Popover {...props}>{childrenWithRef}</Popover>;
});

export default CustomPopover;
