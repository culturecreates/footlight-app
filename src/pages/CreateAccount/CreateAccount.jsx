import React, { useRef } from 'react';
import { Form, notification } from 'antd';
import { EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './createAccount.css';
import LoginButton from '../../components/Button/Auth';
import { PathName } from '../../constants/pathName';
import Auth from '../../layout/Auth';
import PasswordInput from '../../components/Input/Password';
import { useAcceptInviteMutation, useGetInviteDetailsQuery } from '../../services/invite';

function CreateAccount() {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const timestampRef = useRef(Date.now()).current;
  let [searchParams] = useSearchParams();

  const [acceptInvite] = useAcceptInviteMutation();

  let invitationId = searchParams.get('invitationId');

  const {
    currentData: inviteUserData,
    isLoading: inviteUserLoading,
    error: inviteUserError,
  } = useGetInviteDetailsQuery({
    id: invitationId,
    sessionId: timestampRef,
  });

  const onFinish = (values) => {
    acceptInvite({
      id: invitationId,
      password: values.confirmNewPassword,
    })
      .unwrap()
      .then((response) => {
        if (response?.data?.statusCode == 202) {
          // notification.info({
          //   description: t('resetPassword.successNotification'),
          //   placement: 'top',
          // });
          navigate(PathName.Login);
        }
      });
  };

  if (inviteUserError) {
    notification.info({
      description: inviteUserError?.data?.message,
      placement: 'top',
    });
    navigate('/');
  }

  return (
    !inviteUserLoading && (
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
            <Form.Item
              className="create-account-form-item"
              label={t('createAccount.firstName')}
              labelAlign="left"
              name="firstName"
              initialValue={inviteUserData?.firstName}>
              <p className="create-account-read-only-content">{inviteUserData?.firstName}</p>
            </Form.Item>
            <Form.Item
              className="create-account-form-item"
              label={t('createAccount.lastName')}
              labelAlign="left"
              name="lastName"
              initialValue={inviteUserData?.secondName}>
              <p className="create-account-read-only-content">{inviteUserData?.lastName}</p>
            </Form.Item>
            <Form.Item
              className="create-account-form-item"
              label={t('createAccount.email')}
              labelAlign="left"
              name="email"
              initialValue={inviteUserData?.email}>
              <p className="create-account-read-only-content">{inviteUserData?.email}</p>
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
    )
  );
}

export default CreateAccount;
