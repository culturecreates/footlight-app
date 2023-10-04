import React from 'react';
import { Button, Form, message, Modal, notification } from 'antd';
import PasswordInput from '../../Input/Password';
import { CloseCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { getUserDetails } from '../../../redux/reducer/userSlice';
import { useSelector } from 'react-redux';
import { useUpdateCurrentUserMutation } from '../../../services/users';
import { useParams } from 'react-router-dom';
import './changePassword.css';

const ChangePassword = ({ isPopoverOpen, setIsPopoverOpen }) => {
  const [form] = Form.useForm();
  const { user } = useSelector(getUserDetails);
  const { t } = useTranslation();
  const { calendarId } = useParams();

  const [updatePasswords] = useUpdateCurrentUserMutation();

  const handleFormSubmit = async () => {
    try {
      const values = await form.validateFields();

      updatePasswords({
        body: {
          firstName: user?.firstName,
          lastName: user?.lastName,
          email: user?.email,
          interfaceLanguage: user?.languagePreference,
          modifyPassword: {
            currentPassword: values.password,
            newPassword: values.newPassword,
          },
        },
        calendarId,
      })
        .unwrap()
        .then((response) => {
          if (response?.statusCode == 202) {
            notification.success({
              description: t('resetPassword.successNotification'),
              placement: 'top',
              closeIcon: <></>,
              maxCount: 1,
              duration: 3,
            });
            setIsPopoverOpen({ ...isPopoverOpen, password: false });
          }
        })
        .catch((error) => {
          console.log(error);
          message.warning({
            duration: 10,
            maxCount: 1,
            key: 'udpate-user-warning',
            content: (
              <>
                {error?.data?.message} &nbsp;
                <Button
                  type="text"
                  icon={<CloseCircleOutlined style={{ color: '#222732' }} />}
                  onClick={() => message.destroy('udpate-user-warning')}
                />
              </>
            ),
            icon: <ExclamationCircleOutlined />,
          });
        });
    } catch (errorInfo) {
      console.error('Validation Failed:', errorInfo);
    }
  };

  return (
    <Modal
      cancelText={t('dashboard.settings.addUser.passwordModal.Cancel')}
      okText={t('dashboard.settings.addUser.passwordModal.changePassword')}
      cancelButtonProps={{ className: 'cancel-button' }}
      okButtonProps={{ className: 'ok-button' }}
      title={t('dashboard.settings.addUser.passwordModal.changePassword')}
      wrapClassName="change-password-modal"
      open={isPopoverOpen.password}
      onOk={handleFormSubmit}
      bodyStyle={{ padding: 32 }}
      onCancel={() => {
        form.resetFields();
        setIsPopoverOpen({ ...isPopoverOpen, password: false });
      }}>
      <Form form={form} layout="vertical" name="passwordForm" onFinish={handleFormSubmit}>
        <Form.Item
          label={t('dashboard.settings.addUser.passwordModal.Password')}
          name="password"
          rules={[
            {
              required: true,
              message: t('resetPassword.validations.emptyPassword'),
            },
          ]}>
          <PasswordInput placeholder={t('dashboard.settings.addUser.passwordModal.placeHolder.current')} />
        </Form.Item>
        <Form.Item
          label={t('dashboard.settings.addUser.passwordModal.newPassword')}
          name="newPassword"
          rules={[
            {
              required: true,
              message: t('resetPassword.validations.emptyPassword'),
            },
          ]}>
          <PasswordInput placeholder={t('dashboard.settings.addUser.passwordModal.placeHolder.new')} />
        </Form.Item>
        <Form.Item
          label={t('dashboard.settings.addUser.passwordModal.confirmNewPassword')}
          name="confirmPassword"
          dependencies={['newPassword']}
          rules={[
            {
              required: true,
              message: t('resetPassword.validations.emptyPassword'),
            },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('newPassword') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error(t('resetPassword.validations.passwordMatch')));
              },
            }),
          ]}>
          <PasswordInput placeholder={t('dashboard.settings.addUser.passwordModal.placeHolder.confirm')} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ChangePassword;
