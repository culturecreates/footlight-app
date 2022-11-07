import { Layout } from 'antd';
import React from 'react';
import './login.css';
import NavigationBar from '../../components/NavigationBar';
const { Header, Content } = Layout;
const Login = () => (
  <>
    <Layout className="login-wrapper">
      <Header className="login-header">
        <NavigationBar />
      </Header>
      <Content className="login-content">Content</Content>
    </Layout>
  </>
);
export default Login;
