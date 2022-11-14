import React from 'react';
import { Form, Input, Button } from 'antd';
import { UpOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Auth from '../../layout/Auth';
import './forgotPassword.css';
import LoginButton from '../../components/Button/Auth';
import { PathName } from '../../constants/pathName';

function ForgotPassword() {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const navigate = useNavigate();

  return (
    <Auth>
      <span className="back-to-login" onClick={() => navigate(PathName.Login)}>
        <UpOutlined rotate="-90" className="back-to-login-icon" />
        <span className="back-to-login-text">{t('forgotPassword.backToLogin')}</span>
      </span>
      <h3 className="login-heading">{t('forgotPassword.header')}</h3>
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
          label="Email"
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
          <Input className="forgot-password-form-item-input-style" placeholder={t('forgotPassword.emailPlaceHolder')} />
        </Form.Item>

        <Form.Item className="forgot-password-reset-code-button-form-item">
          <LoginButton label={t('forgotPassword.sentResetCodeText')} htmlType="htmlType" />
        </Form.Item>
        <Button
          className="forgot-password-reset-my-password"
          type="text"
          onClick={() => navigate(PathName.ResetPassword)}>
          {t('forgotPassword.alreadyHaveCode')}
        </Button>
      </Form>
    </Auth>
  );
}

export default ForgotPassword;
