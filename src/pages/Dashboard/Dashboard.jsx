import React from 'react';
import './dashboard.css';
import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';
import NavigationBar from '../../components/NavigationBar/Dashboard';
import Sidebar from '../../components/Sidebar/Main';

const { Header, Content } = Layout;

function Dashboard() {
  return (
    <Layout className="dashboard-wrapper">
      <Header className="dashboard-header">
        <NavigationBar />
      </Header>
      <Layout>
        <Sidebar />
        <Layout
          style={{
            background: '#ffffff',
          }}>
          <Content
            className="site-layout-background"
            style={{
              padding: '34px 32px 0px 32px',
              margin: 0,
              minHeight: 280,
            }}>
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
}

export default Dashboard;
