import React from 'react';
import { Form, notification } from 'antd';
import { EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import './createAccount.css';
import LoginButton from '../../components/Button/Auth';
import { PathName } from '../../constants/pathName';
import { useResetPasswordMutation } from '../../services/users';
import Auth from '../../layout/Auth';
import PasswordInput from '../../components/Input/Password';

function CreateAccount() {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [resetPassword] = useResetPasswordMutation();

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
      <div className="create-account-page-wrapper">
        <h3 className="create-account-heading">{t('createAccount.createYourAccount')}</h3>
        <Form
          name="createAccountForm"
          className="create-account-form"
          layout="vertical"
          autoComplete="off"
          requiredMark={false}
          scrollToFirstError={true}
          validateTrigger={'onBlur'}
          form={form}
          onFinish={onFinish}>
          <Form.Item className="create-account-form-item" label={t('createAccount.firstName')} labelAlign="left">
            <p className="create-account-read-only-content">fsofjsj</p>
          </Form.Item>
          <Form.Item className="create-account-form-item" label={t('createAccount.secondName')} labelAlign="left">
            <p className="create-account-read-only-content">fsofjsj</p>
          </Form.Item>
          <Form.Item className="create-account-form-item" label={t('createAccount.email')} labelAlign="left">
            <p className="create-account-read-only-content">fsofjsj</p>
          </Form.Item>
          <Form.Item
            className="create-account-form-item"
            name="newPassword"
            label={t('createAccount.newPassword')}
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
            className="create-account-form-item"
            name="confirmNewPassword"
            label={t('createAccount.confirmNewPassword')}
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
              placeholder={t('createAccount.passwordPlaceHolder')}
              iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
            />
          </Form.Item>

          <Form.Item className="create-account-reset-my-password">
            <LoginButton label={t('createAccount.acceptInvitation')} htmlType="htmlType" />
          </Form.Item>
        </Form>
      </div>
    </Auth>
  );
}

export default CreateAccount;
