import { Layout, Checkbox, Form, Input } from 'antd';
import { EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import React from 'react';
import './login.css';
import NavigationBar from '../../components/NavigationBar';
import LoginButton from '../../components/Button/Auth';
// import AuthenticationInput from '../../components/Input/Common';
// import { useLoginMutation } from '../../services/login';
const { Header, Content } = Layout;
const Login = () => {
  const [form] = Form.useForm();
  // const [login] = useLoginMutation();

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
                remember: true,
              }}
              layout="vertical"
              autoComplete="off"
              scrollToFirstError={true}
              form={form}
              onFinish={onFinish}>
              <Form.Item
                className="login-form-item"
                name="email"
                label="Email"
                labelAlign="left"
                rules={[
                  {
                    type: 'email',
                    message: 'The input is not valid E-mail!'
                  },
                  {
                    required: true,
                    message: 'Please input your E-mail!'
                  }
                ]}>
                <Input placeholder="Enter your email id" />
              </Form.Item>
              <Form.Item
                className="login-form-item"
                name="password"
                label="Password"
                labelAlign="left"
                rules={[
                  {
                    required: true,
                    message: 'Please enter your password!',
                  },
                ]}>
                <Input.Password
                  placeholder="input password"
                  iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                />
              </Form.Item>
              <Form.Item>
                <Form.Item name="remember" valuePropName="checked" noStyle>
                  <Checkbox>
                    <span className="login-remember-me">Remember me</span>
                  </Checkbox>
                </Form.Item>
              </Form.Item>

              <Form.Item>
                <LoginButton label="Log in" htmlType="htmlType" />
              </Form.Item>
              <span className="reset-my-password">Reset my password</span>
            </Form>
          </div>
        </Content>
      </Layout>
    </>
  );
};
export default Login;
