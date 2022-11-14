import { Layout, Checkbox, Form, Input, Button } from 'antd';
import { EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import React, { Suspense, useEffect } from 'react';
import './login.css';
import NavigationBar from '../../components/NavigationBar';
import LoginButton from '../../components/Button/Auth';
import { useLoginMutation } from '../../services/login';
import { useSelector } from 'react-redux';
import { getUserDetails } from '../../redux/reducer/userSlice';
import { PathName } from '../../constants/pathName';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const { Header, Content } = Layout;
const Login = () => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [login, { error }] = useLoginMutation();
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
      <Suspense fallback="Loading...">
        <Layout className="login-wrapper">
          <Header className="login-header">
            <NavigationBar />
          </Header>
          <Content className="login-content">
            <div className="content-wrap">
              <h3 className="login-heading">{t('login.header')}</h3>
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
                  {...(error && {
                    help: error.data.message,
                    validateStatus: 'error',
                  })}
                  rules={[
                    {
                      type: 'email',
                      message: t('login.validations.invalidEmail'),
                    },
                    {
                      required: true,
                      message: t('login.validations.emptyEmail'),
                    },
                  ]}>
                  <Input className="form-item-input-style" placeholder={t('login.emailPlaceHolder')} />
                </Form.Item>
                <Form.Item
                  className="login-form-item"
                  name="password"
                  label={t('login.password')}
                  labelAlign="left"
                  rules={[
                    {
                      required: true,
                      message: t('login.validations.emptyPassword'),
                    },
                  ]}>
                  <Input.Password
                    placeholder={t('login.passwordPlaceHolder')}
                    className="form-item-input-style"
                    iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                  />
                </Form.Item>
                <Form.Item>
                  <Form.Item name="remember" valuePropName="checked" noStyle>
                    <Checkbox>
                      <span className="login-remember-me">{t('login.rememberMe')}</span>
                    </Checkbox>
                  </Form.Item>
                </Form.Item>

                <Form.Item>
                  <LoginButton label={t('login.loginButtonText')} htmlType="htmlType" />
                </Form.Item>
                <Button className="reset-my-password" type="text" onClick={() => navigate(PathName.ResetPassword)}>
                  {t('login.resetMyPasswordText')}
                </Button>
              </Form>
            </div>
          </Content>
        </Layout>
      </Suspense>
    </>
  );
};
export default Login;
