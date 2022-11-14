import React, { Suspense } from 'react';
import NavigationBar from '../../components/NavigationBar';
import { Layout } from 'antd';
import './auth.css';

const { Header, Content } = Layout;

function Auth({ children }) {
  return (
    <>
      <Suspense fallback="Loading...">
        <Layout className="login-wrapper">
          <Header className="login-header">
            <NavigationBar />
          </Header>
          <Content className="login-content">
            <div className="content-wrap">{children}</div>
          </Content>
        </Layout>
      </Suspense>
    </>
  );
}

export default Auth;
