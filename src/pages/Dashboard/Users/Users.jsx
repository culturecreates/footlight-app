import React, { useState, useRef } from 'react';
import './users.css';
import { Form, Row, Col, Select } from 'antd';
import { EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useLocation, useParams } from 'react-router-dom';
import LoginInput from '../../../components/Input/Common';
import PasswordInput from '../../../components/Input/Password';
import PrimaryButton from '../../../components/Button/Primary';
import OutlinedButton from '../../../components/Button/Outlined';
import TextButton from '../../../components/Button/Text';
import StyledInput from '../../../components/Input/Common';
import CustomModal from '../../../components/Modal/Common/CustomModal';
import { useGetCurrentUserQuery, useUpdateCurrentUserMutation } from '../../../services/users';
import { locale } from '../../../constants/localeSupport';
import { usePrompt } from '../../../hooks/usePrompt';

function Users() {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const location = useLocation();
  const timestampRef = useRef(Date.now()).current;
  const { calendarId } = useParams();

  const { currentData: currentUserData, isSuccess: currentUserSuccess } = useGetCurrentUserQuery({
    sessionId: timestampRef,
    calendarId,
  });
  const [updateCurrentUser] = useUpdateCurrentUserMutation();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [password, setPassword] = useState({
    oldPassword: null,
    newPassword: null,
    confirmNewPassword: null,
  });
  const [showDialog, setShowDialog] = useState(false);

  usePrompt(t('common.unsavedChanges'), showDialog);

  const handleModalCancel = () => {
    form?.setFieldsValue({
      oldPassword: null,
      newPassword: null,
      confirmNewPassword: null,
    });
    setPassword({
      oldPassword: null,
      newPassword: null,
      confirmNewPassword: null,
    });
    setIsModalVisible(false);
  };
  const handlePasswordSave = () => {
    form
      .validateFields(['oldPassword', 'newPassword', 'confirmNewPassword'])
      .then((values) => {
        setIsModalVisible(false);
        setPassword({
          oldPassword: values?.oldPassword,
          newPassword: values?.newPassword,
          confirmNewPassword: values?.confirmNewPassword,
        });
      })
      .catch((error) => {
        console.log(error);
      });
  };
  const handleSave = () => {
    form
      .validateFields(['firstName', 'lastName', 'email', 'interfaceLanguage'])
      .then((values) => {
        console.log(values);
        console.log(password);
        updateCurrentUser({
          calendarId,
          body: {
            firstName: values?.firstName,
            lastName: values?.lastName,
            email: values?.email,
            interfaceLanguage: values?.interfaceLanguage,
            ...(password?.oldPassword &&
              password?.newPassword && {
                modifyPassword: {
                  currentPassword: password?.oldPassword,
                  newPassword: password?.newPassword,
                },
              }),
          },
        })
          .unwrap()
          .then((response) => {
            console.log(response);
          })
          .catch((error) => console.log(error));
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const onValuesChangHandler = () => {
    setShowDialog(true);
  };
  return (
    currentUserSuccess && (
      <div className="user-edit-wrapper">
        <Row>
          <Col span={24}>
            <Row justify="space-between">
              <Col>
                <div className="add-edit-event-heading">
                  <h4>{t('dashboard.events.addEditEvent.heading.editEvent')}</h4>
                </div>
              </Col>
              <Col>
                <div className="add-event-button-wrap">
                  <PrimaryButton label={t('dashboard.events.addEditEvent.saveOptions.save')} onClick={handleSave} />
                </div>
              </Col>
            </Row>
            <Row>
              <Col>
                <div className="add-edit-event-heading">
                  <h4>{t('dashboard.events.addEditEvent.heading.editEvent')}</h4>
                </div>
              </Col>
            </Row>
          </Col>
          <Col>
            <Form
              name="userEdit"
              className="user-edit-form"
              initialValues={{
                remember: true,
              }}
              layout="vertical"
              autoComplete="off"
              requiredMark={false}
              scrollToFirstError={true}
              validateTrigger={'onBlur'}
              onValuesChange={onValuesChangHandler}
              form={form}>
              <Form.Item
                name="firstName"
                className="subheading-wrap"
                initialValue={currentUserData?.firstName}
                label={t('dashboard.events.addEditEvent.otherInformation.contact.phoneNumber')}>
                <StyledInput
                  placeholder={t('dashboard.events.addEditEvent.otherInformation.contact.placeHolderPhoneNumber')}
                />
              </Form.Item>
              <Form.Item
                name="lastName"
                className="subheading-wrap"
                initialValue={currentUserData?.lastName}
                label={t('dashboard.events.addEditEvent.otherInformation.contact.phoneNumber')}>
                <StyledInput
                  placeholder={t('dashboard.events.addEditEvent.otherInformation.contact.placeHolderPhoneNumber')}
                />
              </Form.Item>
              <Form.Item
                className="user-edit-form-item"
                name="email"
                label={t('resetPassword.email')}
                labelAlign="left"
                initialValue={currentUserData?.email}
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
                name="interfaceLanguage"
                label={t('dashboard.events.addEditEvent.dates.status')}
                initialValue={currentUserData?.interfaceLanguage?.toUpperCase()}>
                <Select options={locale} />
              </Form.Item>
              <Form.Item name="button">
                <OutlinedButton
                  label={t('dashboard.events.addEditEvent.otherInformation.description.translate')}
                  size="large"
                  onClick={() => setIsModalVisible(true)}
                />
              </Form.Item>
              <CustomModal
                maskClosable
                title={
                  <div className="custom-modal-title-wrapper">
                    <span className="custom-modal-title-heading">
                      {t('dashboard.events.addEditEvent.dates.modal.titleHeading')}
                    </span>
                  </div>
                }
                open={isModalVisible}
                onCancel={handleModalCancel}
                width={500}
                centered
                footer={[
                  <TextButton
                    key="cancel"
                    size="large"
                    label={t('dashboard.events.addEditEvent.dates.cancel')}
                    onClick={handleModalCancel}
                  />,
                  <PrimaryButton
                    key="add-dates"
                    label={t('dashboard.events.addEditEvent.dates.addDates')}
                    onClick={handlePasswordSave}
                  />,
                ]}
                bodyStyle={{ padding: '0px' }}>
                <Row>
                  <Col>
                    <Form.Item
                      className="reset-password-form-item"
                      name="oldPassword"
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
                  </Col>
                </Row>
              </CustomModal>
            </Form>
          </Col>
        </Row>
      </div>
    )
  );
}

export default Users;
