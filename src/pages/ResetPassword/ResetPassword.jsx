import React from 'react';
import { Form, Input, Button, InputNumber } from 'antd';
import { UpOutlined, EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Auth from '../../layout/Auth';
import './resetPassword.css';
import LoginButton from '../../components/Button/Auth';
import { PathName } from '../../constants/pathName';

function ResetPassword() {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const navigate = useNavigate();

  return (
    <Auth>
      <span className="back-to-login" onClick={() => navigate(PathName.Login)}>
        <UpOutlined rotate="-90" className="back-to-login-icon" />
        <span className="back-to-login-text">{t('resetPassword.backToLogin')}</span>
      </span>
      <h3 className="login-heading">{t('resetPassword.header')}</h3>
      <Form
        name="normal_login"
        className="forgot-password-form"
        initialValues={{
          remember: true,
        }}
        layout="vertical"
        autoComplete="off"
        requiredMark={false}
        scrollToFirstError={true}
        form={form}>
        <Form.Item
          className="forgot-password-form-item"
          name="email"
          label={t('resetPassword.email')}
          labelAlign="left"
          rules={[
            {
              type: 'email',
              message: t('forgotPassword.validations.invalidEmail'),
            },
            {
              required: true,
              message: t('forgotPassword.validations.emptyEmail'),
            },
          ]}>
          <Input className="forgot-password-form-item-input-style" placeholder={t('resetPassword.emailPlaceHolder')} />
        </Form.Item>
        <Form.Item label={t('resetPassword.inputNumber')} className="forgot-password-form-item">
          <InputNumber className="form-item-input-style" />
        </Form.Item>
        <Form.Item
          className="login-form-item"
          name="new-password"
          label={t('resetPassword.newPassword')}
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
        <Form.Item
          className="login-form-item"
          name="confirm-new-password"
          label={t('resetPassword.confirmNewPassword')}
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

        <Form.Item className="forgot-password-reset-code-button-form-item">
          <LoginButton label={t('resetPassword.resetPassword')} htmlType="htmlType" />
        </Form.Item>
        <Button className="forgot-password-reset-my-password" type="text">
          {t('resetPassword.newResetcode')}
        </Button>
      </Form>
    </Auth>
  );
}

export default ResetPassword;
