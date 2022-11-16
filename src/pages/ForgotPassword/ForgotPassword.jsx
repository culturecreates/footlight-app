import React from 'react';
import { Form, Input, Button } from 'antd';
import { UpOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Auth from '../../layout/Auth';
import './forgotPassword.css';
import LoginButton from '../../components/Button/Auth';
import { PathName } from '../../constants/pathName';
import { useForgotPasswordMutation } from '../../services/users';

function ForgotPassword() {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [forgotPassword, { error }] = useForgotPasswordMutation();

  const onFinish = (values) => {
    forgotPassword(values.email)
      .unwrap()
      .then((response) => {
        if (response.StatusCode == 202) {
          navigate(PathName.ResetPassword);
        }
      });
  };

  return (
    <Auth>
      <div className="forgot-password-page-wrapper">
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
          form={form}
          onFinish={onFinish}>
          <Form.Item
            className="forgot-password-form-item"
            name="email"
            label={t('forgotPassword.email')}
            labelAlign="left"
            {...(error && {
              help: error.data.message,
              validateStatus: 'error',
            })}
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
            <Input
              className="forgot-password-form-item-input-style"
              placeholder={t('forgotPassword.emailPlaceHolder')}
            />
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
      </div>
    </Auth>
  );
}

export default ForgotPassword;
