import React, { useState, useRef } from 'react';
import './users.css';
import { Form, Row, Col, Select, message, Button, notification } from 'antd';
import { EyeInvisibleOutlined, EyeTwoTone, CloseCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
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
import { useSelector, useDispatch } from 'react-redux';
import { getUserDetails, setUser } from '../../../redux/reducer/userSlice';
import i18n from 'i18next';
import CardEvent from '../../../components/Card/Common/Event';

function Users() {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const timestampRef = useRef(Date.now()).current;
  const { calendarId } = useParams();
  const { accessToken, expiredTime, refreshToken, user } = useSelector(getUserDetails);

  const {
    currentData: currentUserData,
    isSuccess: currentUserSuccess,
    refetch: currentUserRefetch,
  } = useGetCurrentUserQuery({
    sessionId: timestampRef,
    calendarId,
  });
  const [updateCurrentUser] = useUpdateCurrentUserMutation();

  const [isModalVisible, setIsModalVisible] = useState(false);

  const [showDialog, setShowDialog] = useState(false);

  usePrompt(t('common.unsavedChanges'), showDialog);

  const handleModalCancel = () => {
    form?.setFieldsValue({
      oldPassword: null,
      newPassword: null,
      confirmNewPassword: null,
    });
    setIsModalVisible(false);
  };
  const handlePasswordSave = () => {
    form
      .validateFields(['oldPassword', 'newPassword', 'confirmNewPassword'])
      .then(() => {
        let values = form.getFieldsValue(true);
        updateCurrentUser({
          calendarId,
          body: {
            firstName: values?.firstName,
            lastName: values?.lastName,
            email: values?.email,
            interfaceLanguage: values?.interfaceLanguage,
            ...(values?.oldPassword &&
              values?.newPassword && {
                modifyPassword: {
                  currentPassword: values?.oldPassword,
                  newPassword: values?.newPassword,
                },
              }),
          },
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
              setIsModalVisible(false);
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
      })
      .catch((error) => {
        console.log(error);
      });
  };
  const handleSave = () => {
    if (!showDialog) navigate(-1);
    else {
      setShowDialog(false);
      form
        .validateFields(['firstName', 'lastName', 'email', 'interfaceLanguage'])
        .then((values) => {
          updateCurrentUser({
            calendarId,
            body: {
              firstName: values?.firstName,
              lastName: values?.lastName,
              email: values?.email,
              interfaceLanguage: values?.interfaceLanguage,
            },
          })
            .unwrap()
            .then((response) => {
              if (response?.statusCode == 202) {
                i18n.changeLanguage(values?.interfaceLanguage?.toLowerCase());
                currentUserRefetch();
                notification.success({
                  description: t('dashboard.userProfile.notification.profileUpdate'),
                  placement: 'top',
                  closeIcon: <></>,
                  maxCount: 1,
                  duration: 3,
                });
                let userDetails = {
                  accessToken,
                  expiredTime,
                  refreshToken,
                  user: {
                    id: user?.id,
                    firstName: values?.firstName,
                    lastName: values?.lastName,
                    email: values?.email,
                    profileImage: user?.profileImage,
                    roles: user?.roles,
                    isSuperAdmin: user?.isSuperAdmin,
                    interfaceLanguage: values?.interfaceLanguage,
                  },
                };
                dispatch(setUser(userDetails));

                navigate(-1);
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
        })
        .catch((error) => {
          console.log(error);
        });
    }
  };

  const onValuesChangHandler = () => {
    setShowDialog(true);
  };

  return (
    currentUserSuccess && (
      <div className="user-profile-wrapper">
        <Row>
          <Col span={24}>
            <Row justify="space-between">
              <Col>
                <div className="user-profile-heading">
                  <h4 data-cy="heading-user-profile-title">{t('dashboard.userProfile.userProfile')}</h4>
                </div>
              </Col>
              <Col>
                <div className="add-event-button-wrap">
                  <PrimaryButton
                    label={t('dashboard.userProfile.save')}
                    onClick={handleSave}
                    data-cy="button-user-save"
                  />
                </div>
              </Col>
            </Row>
          </Col>
          <CardEvent required={true} marginResponsive="0px">
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
              <div className="user-profile-sub-heading">
                <p>{t('dashboard.userProfile.subHeading')}</p>
              </div>
              <Form.Item
                data-cy="form-item-user-firstname-title"
                name="firstName"
                initialValue={currentUserData?.firstName}
                label={t('dashboard.userProfile.firstName')}
                rules={[
                  {
                    required: true,
                    message: t('dashboard.userProfile.validations.emptyFirstName'),
                  },
                ]}>
                <StyledInput
                  data-cy="input-user-firstname"
                  placeholder={t('dashboard.events.addEditEvent.otherInformation.contact.placeHolderPhoneNumber')}
                />
              </Form.Item>
              <Form.Item
                data-cy="form-item-user-lastname-title"
                name="lastName"
                initialValue={currentUserData?.lastName}
                label={t('dashboard.userProfile.lastName')}
                rules={[
                  {
                    required: true,
                    message: t('dashboard.userProfile.validations.emptyLastName'),
                  },
                ]}>
                <StyledInput
                  data-cy="input-user-lastname"
                  placeholder={t('dashboard.events.addEditEvent.otherInformation.contact.placeHolderPhoneNumber')}
                />
              </Form.Item>
              <Form.Item
                data-cy="form-item-user-email-title"
                name="email"
                label={t('dashboard.userProfile.email')}
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
                  data-cy="input-user-email"
                  placeholder={t('resetPassword.emailPlaceHolder')}
                  disabled={location?.state?.email ? true : false}
                />
              </Form.Item>
              <div className="interfaceLanguage-selector">
                <Form.Item
                  data-cy="form-item-user-language-title"
                  name="interfaceLanguage"
                  label={t('dashboard.userProfile.languagePreference')}
                  initialValue={currentUserData?.interfaceLanguage?.toUpperCase()}
                  required>
                  <Select options={locale} data-cy="select-user-language" />
                </Form.Item>
              </div>
              <Form.Item name="button">
                <OutlinedButton
                  data-cy="button-user-change-password"
                  label={t('dashboard.userProfile.changePassword')}
                  size="large"
                  onClick={() => setIsModalVisible(true)}
                />
              </Form.Item>
              <CustomModal
                maskClosable
                className="change-password-modal"
                title={
                  <div className="custom-modal-title-wrapper">
                    <span className="custom-modal-title-heading" data-cy="span-change-password">
                      {t('dashboard.userProfile.changePasswordButton')}
                    </span>
                  </div>
                }
                open={isModalVisible}
                onCancel={handleModalCancel}
                style={{ maxWidth: '500px', padding: '16px' }}
                centered
                width="100%"
                footer={[
                  <TextButton
                    data-cy="button-user-change-password-cancel"
                    key="cancel"
                    size="large"
                    label={t('dashboard.userProfile.cancel')}
                    onClick={handleModalCancel}
                  />,
                  <PrimaryButton
                    data-cy="button-user-change-password-save"
                    key="add-dates"
                    label={t('dashboard.userProfile.changePasswordButton')}
                    onClick={handlePasswordSave}
                  />,
                ]}
                bodyStyle={{ padding: '32px' }}>
                <Row>
                  <Col span={24} className="change-password-modal-body">
                    <Form.Item
                      data-cy="form-item-old-password-title"
                      name="oldPassword"
                      label={t('dashboard.userProfile.password')}
                      labelAlign="left"
                      className="user-profile-form-item"
                      rules={[
                        {
                          required: true,
                          message: t('resetPassword.validations.emptyPassword'),
                        },
                      ]}>
                      <PasswordInput
                        data-cy="input-user-old-password"
                        placeholder={t('dashboard.userProfile.passwordPlaceHolder')}
                        iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                      />
                    </Form.Item>
                    <Form.Item
                      data-cy="form-item-new-password-title"
                      name="newPassword"
                      label={t('dashboard.userProfile.newPassword')}
                      labelAlign="left"
                      className="user-profile-form-item"
                      rules={[
                        {
                          required: true,
                          message: t('resetPassword.validations.emptyPassword'),
                        },
                      ]}>
                      <PasswordInput
                        data-cy="input-new-password"
                        placeholder={t('dashboard.userProfile.newPasswordPlaceholder')}
                        iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                      />
                    </Form.Item>
                    <Form.Item
                      data-cy="form-item-confirm-password-title"
                      name="confirmNewPassword"
                      label={t('dashboard.userProfile.confirmNewPassword')}
                      labelAlign="left"
                      className="user-profile-form-item"
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
                        data-cy="input-confirm-password"
                        placeholder={t('dashboard.userProfile.confirmNewPasswordPlaceHolder')}
                        iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </CustomModal>
            </Form>
          </CardEvent>
        </Row>
      </div>
    )
  );
}

export default Users;
