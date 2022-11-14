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
    <Auth className="reset-password">
      <span className="back-to-login" onClick={() => navigate(PathName.Login)}>
        <UpOutlined rotate="-90" className="back-to-login-icon" />
        <span className="back-to-login-text">{t('resetPassword.backToLogin')}</span>
      </span>
      <h3 className="reset-password-heading">{t('resetPassword.header')}</h3>
      <Form
        name="normal_login"
        className="reset-password-form"
        initialValues={{
          remember: true,
        }}
        layout="vertical"
        autoComplete="off"
        requiredMark={false}
        scrollToFirstError={true}
        form={form}>
        <Form.Item
          className="reset-password-form-item"
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
          <Input className="reset-password-form-item-input-style" placeholder={t('resetPassword.emailPlaceHolder')} />
        </Form.Item>
        <Form.Item label={t('resetPassword.inputNumber')} className="reset-password-form-item">
          <InputNumber className="reset-password-input-number-style" controls={false} />
        </Form.Item>
        <Form.Item
          className="reset-password-form-item"
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
            className="reset-password-form-item-input-style"
            iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
          />
        </Form.Item>
        <Form.Item
          className="reset-password-form-item"
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
            className="reset-password-form-item-input-style"
            iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
          />
        </Form.Item>

        <Form.Item className="reset-password-reset-my-password">
          <LoginButton label={t('resetPassword.resetPassword')} htmlType="htmlType" />
        </Form.Item>
        <Button className="reset-password-resend-code" type="text">
          {t('resetPassword.newResetcode')}
        </Button>
      </Form>
    </Auth>
  );
}

export default ResetPassword;
