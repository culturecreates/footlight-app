import React from 'react';
import './users.css';
import { Form, InputNumber } from 'antd';
import { EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import LoginInput from '../../../components/Input/Common';
import PasswordInput from '../../../components/Input/Password';

function Users() {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const location = useLocation();
  return (
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
      form={form}>
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
    </Form>
  );
}

export default Users;
