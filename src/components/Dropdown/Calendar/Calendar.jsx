import React from 'react';
import './calendar.css';
import { DownOutlined } from '@ant-design/icons';
import { Dropdown, Space } from 'antd';

function Calendar() {
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
      type: 'divider',
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
      <div>
        <Space>
          Click me
          <DownOutlined />
        </Space>
      </div>
    </Dropdown>
  );
}

export default Calendar;
