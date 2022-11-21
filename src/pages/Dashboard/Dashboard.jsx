import React from 'react';
import './dashboard.css';
import { Layout } from 'antd';
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
            padding: '0 24px 24px',
          }}>
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
