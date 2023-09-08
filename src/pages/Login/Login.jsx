import { Checkbox, Form, Button } from 'antd';
import { EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import React, { useEffect } from 'react';
import './login.css';
import LoginButton from '../../components/Button/Auth';
import { useLoginMutation } from '../../services/login';
import { useDispatch, useSelector } from 'react-redux';
import { clearUser, getUserDetails } from '../../redux/reducer/userSlice';
import { PathName } from '../../constants/pathName';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Auth from '../../layout/Auth';
import LoginInput from '../../components/Input/Common';
import PasswordInput from '../../components/Input/Password';
import { setInterfaceLanguage } from '../../redux/reducer/interfaceLanguageSlice';
import i18n from 'i18next';
import Cookies from 'js-cookie';

const Login = () => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [login, { error }] = useLoginMutation();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { accessToken } = useSelector(getUserDetails);

  const onFinish = (values) => {
    login({ email: values.email, password: values.password })
      .unwrap()
      .then((response) => {
        navigate(PathName.Dashboard, { state: { previousPath: 'login' } });
        dispatch(setInterfaceLanguage(response.user.interfaceLanguage?.toLowerCase()));
        i18n.changeLanguage(response?.user?.interfaceLanguage?.toLowerCase());
      });
  };
  useEffect(() => {
    const savedAccessToken = Cookies.get('accessToken');
    const calenderId = Cookies.get('calendarId');
    if (location?.state?.previousPath === 'logout') {
      dispatch(clearUser());
    }
    if (
      ((accessToken && accessToken != '') || (savedAccessToken && savedAccessToken != '')) &&
      calenderId &&
      calenderId != ''
    ) {
      navigate(PathName.Dashboard, { state: { previousPath: 'login' } });
    }
  }, []);

  useEffect(() => {
    const calenderId = Cookies.get('calendarId');
    if (accessToken && accessToken != '' && calenderId && calenderId != '') {
      navigate(PathName.Dashboard, { state: { previousPath: 'login' } });
    }
  }, [accessToken]);

  return (
    <Auth>
      <div className="login-page-wrapper">
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
          validateTrigger={'onBlur'}
          form={form}
          onFinish={onFinish}>
          <Form.Item
            className="login-form-item"
            name="email"
            label={t('login.email')}
            labelAlign="left"
            {...(error && {
              help: t('login.failure'),
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
            <LoginInput placeholder={t('login.emailPlaceHolder')} />
          </Form.Item>
          <Form.Item
            className="login-form-item"
            name="password"
            label={t('login.password')}
            labelAlign="left"
            {...(error && {
              help: t('login.failure'),
              validateStatus: 'error',
            })}
            rules={[
              {
                required: true,
                message: t('login.validations.emptyPassword'),
              },
            ]}>
            <PasswordInput
              placeholder={t('login.passwordPlaceHolder')}
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
          <Button className="reset-my-password" type="text" onClick={() => navigate(PathName.ForgotPassword)}>
            {t('login.resetMyPasswordText')}
          </Button>
        </Form>
      </div>
    </Auth>
  );
};
export default Login;
