import React from 'react';
import './calendar.css';
import { Dropdown } from 'antd';

function Calendar({ children }) {
  const items = [
    {
      label: <a href="https://www.antgroup.com">1st menu item</a>,
      key: '0',
    },
    {
      label: <a href="https://www.aliyun.com">2nd menu item</a>,
      key: '1',
    },

    {
      label: '3rd menu item',
      key: '3',
    },
  ];
  return (
    <Dropdown
      menu={{
        items,
      }}
      trigger={['click']}>
      {children}
    </Dropdown>
  );
}

export default Calendar;
