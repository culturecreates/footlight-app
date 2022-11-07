import { Layout, Checkbox, Form } from 'antd';
import React from 'react';
import './login.css';
import NavigationBar from '../../components/NavigationBar';
import LoginButton from '../../components/Button/Auth';
import AuthenticationInput from '../../components/Input/Common';
const { Header, Content } = Layout;
const Login = () => {
  const onFinish = (values) => {
    console.log('Received values of form: ', values);
  };
  return (
    <>
      <Layout className="login-wrapper">
        <Header className="login-header">
          <NavigationBar />
        </Header>
        <Content className="login-content">
          <div className="content-wrap">
            <h3 className="login-heading">Log in to Footlight</h3>
            <Form
              name="normal_login"
              className="login-form"
              initialValues={{
                remember: true
              }}
              layout="vertical"
              autoComplete="off"
              scrollToFirstError={true}
              onFinish={onFinish}>
              <Form.Item
                name="email"
                label="Email"
                labelAlign="left"
                rules={[
                  {
                    required: true,
                    message: 'Please enter your email!'
                  }
                ]}>
                <AuthenticationInput type="email" placeholder="Enter your email address" />
              </Form.Item>
              <Form.Item
                name="password"
                label="Password"
                labelAlign="left"
                rules={[
                  {
                    required: true,
                    message: 'Please enter your password!'
                  }
                ]}>
                <AuthenticationInput type="password" placeholder="Enter your password" />
              </Form.Item>
              <Form.Item>
                <Form.Item name="remember" valuePropName="checked" noStyle>
                  <Checkbox>Remember me</Checkbox>
                </Form.Item>
              </Form.Item>

              <Form.Item>
                <LoginButton label="Log in" />
              </Form.Item>
              <a className="login-form-forgot" href="">
                Reset my password
              </a>
            </Form>
          </div>
        </Content>
      </Layout>
    </>
  );
};
export default Login;
