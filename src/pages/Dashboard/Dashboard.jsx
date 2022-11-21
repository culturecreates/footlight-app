import React, { useState } from 'react';
import './dashboard.css';
import { Breadcrumb, Layout, Menu } from 'antd';
import NavigationBar from '../../components/NavigationBar/Dashboard';
import { sidebarItems } from '../../constants/sidebarItems';

const { Header, Content, Sider } = Layout;

const items2 = sidebarItems.map((item, index) => {
  const key = String(index + 1);
  return {
    key: key,
    icon: item.icon,
    label: item.name,
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
