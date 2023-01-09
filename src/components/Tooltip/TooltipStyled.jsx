import React from 'react';
import { Tooltip } from 'antd';
import './tooltipStyled.css';

function TooltipStyled(props) {
  return (
    <Tooltip
      {...props}
      color={'#0F0E98'}
      overlayInnerStyle={{
        fontFamily: 'Roboto',
        fontStyle: 'normal',
        fontWeight: 600,
        fontSize: '12px',
        borderRadius: '4px',
        boxShadow: '0px 8px 32px rgba(0, 0, 0, 0.2)',
      }}
      overlayClassName="tooltip-wrapper">
      {props?.children}
    </Tooltip>
  );
}

export default TooltipStyled;
