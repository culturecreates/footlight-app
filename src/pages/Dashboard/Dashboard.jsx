import React, { useState } from 'react';
import './dashboard.css';
import { LaptopOutlined, NotificationOutlined, UserOutlined } from '@ant-design/icons';
import { Breadcrumb, Layout, Menu } from 'antd';
import NavigationBar from '../../components/NavigationBar/Dashboard';

const { Header, Content, Sider } = Layout;

const items2 = [UserOutlined, LaptopOutlined, NotificationOutlined].map((icon, index) => {
  const key = String(index + 1);
  return {
    key: `sub${key}`,
    icon: React.createElement(icon),
    label: `subnav ${key}`,
    children: new Array(4).fill(null).map((_, j) => {
      const subKey = index * 4 + j + 1;
      return {
        key: subKey,
        label: `option${subKey}`,
      };
    }),
  };
});

function Dashboard() {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <Layout>
      <Header className="dashboard-header">
        <NavigationBar />
      </Header>
      <Layout>
        <Sider
          width={200}
          className="site-layout-background"
          collapsible
          collapsed={collapsed}
          onCollapse={(value) => setCollapsed(value)}>
          <Menu
            mode="inline"
            defaultSelectedKeys={['1']}
            defaultOpenKeys={['sub1']}
            style={{
              height: '100%',
              borderRight: 0,
            }}
            items={items2}
          />
        </Sider>
        <Layout
          style={{
            padding: '0 24px 24px',
          }}>
          <Breadcrumb
            style={{
              margin: '16px 0',
            }}>
            <Breadcrumb.Item>Home</Breadcrumb.Item>
            <Breadcrumb.Item>List</Breadcrumb.Item>
            <Breadcrumb.Item>App</Breadcrumb.Item>
          </Breadcrumb>
          <Content
            className="site-layout-background"
            style={{
              padding: 24,
              margin: 0,
              minHeight: 280,
            }}>
            Content
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
}

export default Dashboard;
