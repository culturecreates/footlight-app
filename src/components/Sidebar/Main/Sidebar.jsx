import React, { useState } from 'react';
import './sidebar.css';
import { Layout, Menu } from 'antd';
import { sidebarItems } from '../../../constants/sidebarItems';
// import CalendarList from '../../Dropdown/Calendar';

const { Sider } = Layout;

function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  const items = sidebarItems.map((item, index) => {
    const key = String(index + 1);
    return {
      key: key,
      icon: item.icon,
      label: item.name,
      className: 'sidebar-menu-item',
    };
  });

  const calendarItem = [
    {
      key: '0',
      icon: (
        <img
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '73px',
          }}
          src={require('../../../assets/images/logo-tout-culture.png')}
        />
      ),
      label: 'calendar',
      className: 'sidebar-calendar',
    },
  ];
  return (
    <Sider width={256} className="sidebar-wrapper" collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
      <Menu
        defaultSelectedKeys={['1']}
        style={{
          height: 'auto',
          borderRight: 0,
        }}
        items={calendarItem}
      />
      <Menu
        defaultSelectedKeys={['1']}
        style={{
          height: 'auto',
          borderRight: 0,
        }}
        items={items}
      />
    </Sider>
  );
}

export default Sidebar;
