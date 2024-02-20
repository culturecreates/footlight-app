import React from 'react';
import { PlusOutlined } from '@ant-design/icons';
import { Popover } from 'antd';
import './changeTypeLayout.css';

const ChangeTypeLayout = ({ children }) => {
  return (
    <>
      {children ? (
        <div className="floating-modal-wrapper">
          <Popover
            content={children}
            autoAdjustOverflow={false}
            arrow={false}
            overlayClassName="change-type-popover"
            placement="bottomRight"
            getPopupContainer={(trigger) => trigger.parentNode}
            trigger={['click']}>
            <PlusOutlined className="change-type-icon" />
          </Popover>
        </div>
      ) : null}
      {children && <div className="aside-content-wrapper">{children}</div>}
    </>
  );
};

export default ChangeTypeLayout;
