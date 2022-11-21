import React, { useState } from 'react';
import './sidebar.css';
import { Layout, Menu } from 'antd';
import { sidebarItems } from '../../../constants/sidebarItems';

const { Sider } = Layout;

function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  const items = sidebarItems.map((item, index) => {
    const key = String(index + 1);
    return {
      key: key,
      icon: item.icon,
      label: item.name,
    };
  });
  return (
    <Sider
      width={200}
      className="sidebar-wrapper"
      collapsible
      collapsed={collapsed}
      onCollapse={(value) => setCollapsed(value)}>
      <Menu
        defaultSelectedKeys={['1']}
        style={{
          height: '100%',
          borderRight: 0,
        }}
        items={items}
      />
    </Sider>
  );
}

export default Sidebar;
