import React, { useEffect } from 'react';
import './dashboard.css';
import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';
import NavigationBar from '../../components/NavigationBar/Dashboard';
import Sidebar from '../../components/Sidebar/Main';
import { useNavigate } from 'react-router-dom';
import { PathName } from '../../constants/pathName';
import { useSelector } from 'react-redux';
import { getUserDetails } from '../../redux/reducer/userSlice';

const { Header, Content } = Layout;

function Dashboard() {
  const navigate = useNavigate();
  const { accessToken } = useSelector(getUserDetails);
  useEffect(() => {
    if (!accessToken && accessToken === '') navigate(PathName.Login);
  }, [accessToken]);
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
