import React from 'react';
import { Form, Button, InputNumber, notification } from 'antd';
import { UpOutlined, EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import './resetPassword.css';
import LoginButton from '../../components/Button/Auth';
import { PathName } from '../../constants/pathName';
import { useResetPasswordMutation } from '../../services/users';
import Auth from '../../layout/Auth';
import LoginInput from '../../components/Input/Common';
import PasswordInput from '../../components/Input/Password';

function ResetPassword() {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const location = useLocation();
  const [resetPassword, { error }] = useResetPasswordMutation();

  const onFinish = (values) => {
    resetPassword({
      email: values.email,
      newPassword: values.confirmNewPassword,
      oneTimePassword: values.oneTimePassword,
    }).then((response) => {
      if (response?.data?.statusCode == 202) {
        notification.info({
          description: t('resetPassword.successNotification'),
          placement: 'top',
        });
        navigate(PathName.Login);
      }
    });
  };

  return (
    <Auth>
      <div className="reset-password-page-wrapper">
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
          validateTrigger={'onBlur'}
          form={form}
          onFinish={onFinish}>
          <Form.Item
            className="reset-password-form-item"
            name="email"
            label={t('resetPassword.email')}
            labelAlign="left"
            initialValue={location?.state?.email}
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
            <LoginInput
              placeholder={t('resetPassword.emailPlaceHolder')}
              disabled={location?.state?.email ? true : false}
            />
          </Form.Item>
          <Form.Item
            label={t('resetPassword.inputNumber')}
            name="oneTimePassword"
            {...(error && {
              help: error?.data?.message,
              validateStatus: 'error',
            })}
            rules={[
              {
                required: true,
                message: t('resetPassword.validations.digitCode'),
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
            <PasswordInput
              placeholder={t('resetPassword.passwordPlaceHolder')}
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
                message: t('resetPassword.validations.emptyPassword'),
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  } else return Promise.reject(new Error(t('resetPassword.validations.passwordMatch')));
                },
              }),
            ]}>
            <PasswordInput
              placeholder={t('resetPassword.passwordPlaceHolder')}
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
      </div>
    </Auth>
  );
}

export default ResetPassword;
