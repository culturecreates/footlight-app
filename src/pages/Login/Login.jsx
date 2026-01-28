import { Checkbox, Form, Button } from 'antd';
import { EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import React, { useEffect } from 'react';
import './login.css';
import LoginButton from '../../components/Button/Auth';
import LoadingIndicator from '../../components/LoadingIndicator';
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
  const [login, { error, isLoading: loginLoading }] = useLoginMutation();
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
    const calenderId = sessionStorage.getItem('calendarId');
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
    const calenderId = sessionStorage.getItem('calendarId');
    if (accessToken && accessToken != '' && calenderId && calenderId != '') {
      navigate(PathName.Dashboard, { state: { previousPath: 'login' } });
    }
  }, [accessToken]);

  return loginLoading ? (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(255, 255, 255, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}>
      <LoadingIndicator />
    </div>
  ) : (
    <Auth>
      <div className="login-page-wrapper">
        <h3 className="login-heading" data-cy="heading-login-heading">
          {t('login.header')}
        </h3>
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
            <LoginInput placeholder={t('login.emailPlaceHolder')} data-cy="input-login-email" />
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
              data-cy="input-login-password"
            />
          </Form.Item>
          <Form.Item>
            <Form.Item name="remember" valuePropName="checked" noStyle>
              <Checkbox>
                <span className="login-remember-me" data-cy="span-login-remember-me-checkbox">
                  {t('login.rememberMe')}
                </span>
              </Checkbox>
            </Form.Item>
          </Form.Item>

          <Form.Item>
            <LoginButton label={t('login.loginButtonText')} htmlType="htmlType" data-cy="button-login-submit" />
          </Form.Item>
          <Button
            className="reset-my-password"
            type="text"
            onClick={() => navigate(PathName.ForgotPassword)}
            data-cy="button-reset-my-password">
            {t('login.resetMyPasswordText')}
          </Button>
        </Form>
      </div>
    </Auth>
  );
};
export default Login;
