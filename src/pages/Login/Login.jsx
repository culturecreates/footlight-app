import { Layout, Checkbox, Form, Input, Button } from 'antd';
import { EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import React, { useEffect } from 'react';
import './login.css';
import NavigationBar from '../../components/NavigationBar';
import LoginButton from '../../components/Button/Auth';
// import AuthenticationInput from '../../components/Input/Common';
import { useLoginMutation } from '../../services/login';
import { useSelector } from 'react-redux';
import { getUserDetails } from '../../redux/reducer/userSlice';
import { PathName } from '../../constants/pathName';
import { useNavigate } from 'react-router-dom';

const { Header, Content } = Layout;
const Login = () => {
  const [form] = Form.useForm();
  const [login] = useLoginMutation();
  const navigate = useNavigate();
  const { accessToken } = useSelector(getUserDetails);

  const onFinish = (values) => {
    login({ email: values.email, password: values.password })
      .unwrap()
      .then(() => navigate(PathName.Dashboard));
  };

  useEffect(() => {
    if (accessToken) navigate(PathName.Dashboard);
  }, [accessToken]);

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
              requiredMark={false}
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
                    message: 'The input is not a valid email!'
                  },
                  {
                    required: true,
                    message: 'Please enter your email address!'
                  }
                ]}>
                <Input className="form-item-input-style" placeholder="Enter your email address" />
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
                  placeholder="Enter your password"
                  className="form-item-input-style"
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
              <Button className="reset-my-password" type="text" onClick={() => navigate(PathName.ResetPassword)}>
                Reset my password
              </Button>
            </Form>
          </div>
        </Content>
      </Layout>
    </>
  );
};
export default Login;
