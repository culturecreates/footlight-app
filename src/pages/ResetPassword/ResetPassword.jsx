import React from 'react';
import { Form, Input, Button, InputNumber } from 'antd';
import { UpOutlined, EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Auth from '../../layout/Auth';
import './resetPassword.css';
import LoginButton from '../../components/Button/Auth';
import { PathName } from '../../constants/pathName';
import { useResetPasswordMutation } from '../../services/users';

function ResetPassword() {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [resetPassword] = useResetPasswordMutation();

  const onFinish = (values) => {
    console.log(values);
    resetPassword({
      email: values.email,
      newPassword: values.confirmNewPassword,
      oneTimePassword: values.oneTimePassword,
    }).then(() => navigate(PathName.Login));
  };
  return (
    <Auth className="reset-password">
      <span className="back-to-login" onClick={() => navigate(PathName.Login)}>
        <UpOutlined rotate="-90" className="back-to-login-icon" />
        <span className="back-to-login-text">{t('resetPassword.backToLogin')}</span>
      </span>
      <h3 className="reset-password-heading">{t('resetPassword.header')}</h3>
      <p className="reset-password-subheading">{t('resetPassword.subHeading')}</p>

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
        form={form}
        onFinish={onFinish}>
        <Form.Item
          className="reset-password-form-item"
          name="email"
          label={t('resetPassword.email')}
          labelAlign="left"
          rules={[
            {
              type: 'email',
              message: t('resetPassword.validations.invalidEmail'),
            },
            {
              required: true,
              message: t('resetPassword.validations.emptyEmail'),
            },
          ]}>
          <Input className="reset-password-form-item-input-style" placeholder={t('resetPassword.emailPlaceHolder')} />
        </Form.Item>
        <Form.Item
          label={t('resetPassword.inputNumber')}
          name="oneTimePassword"
          rules={[
            {
              required: true,
              message: 'Please enter the 6-digit reset code',
            },
          ]}
          className="reset-password-form-item">
          <InputNumber
            className="reset-password-input-number-style"
            controls={false}
            placeholder={t('resetPassword.inputNumberPlaceholder')}
          />
        </Form.Item>
        <Form.Item
          className="reset-password-form-item"
          name="newPassword"
          label={t('resetPassword.newPassword')}
          labelAlign="left"
          rules={[
            {
              required: true,
              message: t('resetPassword.validations.emptyPassword'),
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
          name="confirmNewPassword"
          label={t('resetPassword.confirmNewPassword')}
          labelAlign="left"
          rules={[
            {
              required: true,
              message: t('login.validations.emptyPassword'),
            },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('newPassword') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('The two passwords that you entered do not match!'));
              },
            }),
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
        <Button className="reset-password-resend-code" type="text" onClick={() => navigate(PathName.ForgotPassword)}>
          {t('resetPassword.newResetcode')}
        </Button>
      </Form>
    </Auth>
  );
}

export default ResetPassword;
