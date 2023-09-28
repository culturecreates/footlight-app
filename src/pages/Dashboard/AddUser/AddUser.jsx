import React, { useRef } from 'react';
import { LeftOutlined, CalendarOutlined, CloseCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { Button, Card, Col, Dropdown, Form, message, notification, Row, Typography } from 'antd';
import PrimaryButton from '../../../components/Button/Primary';
import { createSearchParams, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import OutlinedButton from '../../..//components/Button/Outlined';
import { useTranslation } from 'react-i18next';
import FeatureFlag from '../../../layout/FeatureFlag/FeatureFlag';
import { featureFlags } from '../../../utils/featureFlags';
import './addUser.css';
import i18n from 'i18next';
import { DownOutlined } from '@ant-design/icons';
import {
  useCurrentUserLeaveCalendarMutation,
  // useDeleteUserMutation,
  useLazyGetUserByIdQuery,
  useUpdateCurrentUserMutation,
  useUpdateUserByIdMutation,
} from '../../../services/users';
import AuthenticationInput from '../../../components/Input/Common/AuthenticationInput';
import { userLanguages } from '../../../constants/userLanguagesÏ';
import { useState, useEffect } from 'react';
import { userRoles, userRolesWithTranslation } from '../../../constants/userRoles';
import { useDispatch, useSelector } from 'react-redux';
import { getUserDetails, setUser } from '../../../redux/reducer/userSlice';
import { contentLanguageBilingual } from '../../../utils/bilingual';
import { useOutletContext } from 'react-router-dom';
import CalendarSelect from '../../../components/List/User/CalenderSelect/CalendarSelect';
import ChangePassword from '../../../components/Modal/ChangePassword/ChangePassword';
import { useInviteUserMutation } from '../../../services/invite';
import { Confirm } from '../../../components/Modal/Confirm/Confirm';
import { setErrorStates } from '../../../redux/reducer/ErrorSlice';

const AddUser = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { calendarId } = useParams();
  const location = useLocation();
  let [searchParams, setSearchParams] = useSearchParams();
  const [formInstance] = Form.useForm();
  const [currentCalendarData] = useOutletContext();
  const userId = searchParams.get('id');
  const timestampRef = useRef(Date.now()).current;

  const calendarContentLanguage = currentCalendarData?.contentLanguage;

  const { accessToken, expiredTime, refreshToken, user } = useSelector(getUserDetails);

  const [isPopoverOpen, setIsPopoverOpen] = useState({ organization: false, calendar: false, password: false });
  const [selectedCalendars, setSelectedCalendars] = useState([]);
  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    email: '',
    userType: '',
    languagePreference: { key: '', label: '' },
  });

  const [isCurrentUser, setIsCurrentUser] = useState(false);

  const calendar = user?.roles.filter((calendar) => {
    return calendar.calendarId === calendarId;
  });

  const [getUser, { isFetching: isLoading, isSuccess: isUserFetchSuccess }] = useLazyGetUserByIdQuery();

  const [
    currentUserLeaveCalendar,
    // { isSuccess: isCurrentUserLeaveCalendarSuccess, isError: isCurrentUserLeaveCalendarError },
  ] = useCurrentUserLeaveCalendarMutation();
  // const [deleteUser] = useDeleteUserMutation();
  const [inviteUser] = useInviteUserMutation();
  const [updateUserById] = useUpdateUserByIdMutation();
  const [updateCurrentUser] = useUpdateCurrentUserMutation();

  useEffect(() => {
    if (userId) {
      userId === user?.id && setIsCurrentUser(true);

      getUser({ userId, calendarId, sessionId: timestampRef })
        .unwrap()
        .then((response) => {
          setSelectedCalendars(response.roles);
          const requiredRole = response?.roles.filter((r) => {
            return r.calendarId === calendarId;
          });
          const selectedLanguage = userLanguages.find((item) => item.key === response.interfaceLanguage);

          setUserData({
            firstName: response?.firstName,
            lastName: response?.lastName,
            phoneNumber: response?.phoneNumber,
            email: response?.email,
            userType: requiredRole[0]?.role,
            languagePreference: {
              key: response.interfaceLanguage,
              label: selectedLanguage?.label ? selectedLanguage?.label : '',
            },
            calendars: response.roles,
          });
        });
    } else if (location.state?.data) {
      setSearchParams(createSearchParams({ id: location.state.data.id }));
    }
  }, [userId]);

  useEffect(() => {
    if (!adminCheckHandler()) {
      dispatch(setErrorStates({ errorCode: '403', isError: true, message: 'Forbidden resource.' }));
    }
  }, []);

  useEffect(() => {
    if (userId) {
      formInstance.setFieldsValue({
        firstName: userData.firstName,
        lastName: userData.lastName,
        phoneNumber: userData.phoneNumber,
        email: userData.email,
        userType: userData.userType,
        languagePreference: userData.languagePreference,
      });
    }
  }, [userData]);

  // handlers

  const validateNotEmpty = (_, value, message) => {
    if (value === '') {
      return Promise.reject(new Error(message));
    } else {
      return Promise.resolve();
    }
  };

  const adminCheckHandler = () => {
    if (calendar[0]?.role === userRoles.ADMIN || user?.isSuperAdmin) return true;
    else return false;
  };

  const onSaveHandler = () => {
    if (!userId) {
      formInstance
        .validateFields()
        .then((values) => {
          inviteUser({
            firstName: values.firstName,
            lastName: values.lastName,
            email: values.email,
            role: values.userType,
            calendarId,
          }).then((res) => {
            notification.success({
              description: t(`dashboard.settings.addUser.notification.invitation`),
              key: res.message,
              placement: 'top',
              closeIcon: <></>,
              maxCount: 1,
              duration: 3,
            });
            navigate(-2);
          });
        })
        .catch((errors) => {
          console.error('Validation errors:', errors);
        });
    }
    if (isCurrentUser) {
      formInstance
        .validateFields()
        .then((values) => {
          updateCurrentUser({
            calendarId,
            body: {
              firstName: values?.firstName,
              lastName: values?.lastName,
              email: values?.email,
              interfaceLanguage: values?.languagePreference?.key,
            },
          })
            .unwrap()
            .then((response) => {
              if (response?.statusCode == 202) {
                i18n.changeLanguage(values?.languagePreference?.key?.toLowerCase());
                getUser({ userId, calendarId })
                  .unwrap()
                  .then((response) => {
                    const requiredRole = response?.roles.filter((r) => {
                      return r.calendarId === calendarId;
                    });

                    const selectedLanguage = userLanguages.find((item) => item.key === response.interfaceLanguage);

                    setUserData({
                      firstName: response?.firstName,
                      lastName: response?.lastName,
                      phoneNumber: response?.phoneNumber,
                      email: response?.email,
                      userType: requiredRole[0]?.role,
                      languagePreference: { key: response.interfaceLanguage, label: selectedLanguage },
                      calendars: response.roles,
                    });
                  });
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
                    interfaceLanguage: values?.languagePreference?.key,
                  },
                };
                dispatch(setUser(userDetails));

                navigate(-1);
              }
            })
            .catch((error) => {
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
    } else if (userId) {
      formInstance
        .validateFields()
        .then((values) => {
          updateUserById({
            id: userId,
            calendarId,
            body: {
              firstName: values.firstName,
              lastName: values.lastName,
              email: values.email,
              interfaceLanguage: values?.languagePreference?.key,
              modifyRole: {
                userId: userId,
                role: values.userType,
                calendarId,
              },
            },
          })
            .unwrap()
            .then((res) => {
              notification.success({
                description: t(`dashboard.settings.addUser.notification.updateUser`),
                key: res.message,
                placement: 'top',
                closeIcon: <></>,
                maxCount: 1,
                duration: 3,
              });
              navigate(-2);
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

        .catch((errors) => {
          console.error('Validation errors:', errors);
        });
    }
  };

  const setFormItemValues = ({ value, fieldType }) => {
    setUserData({ ...userData, [fieldType]: value });
  };

  const removeCalendarHandler = (index) => {
    if (isCurrentUser) {
      Confirm({
        title: t('dashboard.settings.addUser.confirmLeave'),
        onAction: () => {
          currentUserLeaveCalendar({ calendarId });
          setSelectedCalendars((prevState) => {
            const updatedArray = prevState.filter((_, i) => index !== i);
            return updatedArray;
          });
        },
        content: t('dashboard.settings.addUser.leaveCalender'),
        okText: t('dashboard.settings.addUser.leave'),
        cancelText: t('dashboard.events.deleteEvent.cancel'),
      });
    } else if (userId) {
      Confirm({
        title: t('dashboard.settings.addUser.confirmLeave'),
        onAction: () => {
          currentUserLeaveCalendar({ calendarId });
          setSelectedCalendars((prevState) => {
            const updatedArray = prevState.filter((_, i) => index !== i);
            return updatedArray;
          });
        },
        content: t('dashboard.settings.addUser.leaveCalender'),
        okText: t('dashboard.settings.addUser.leave'),
        cancelText: t('dashboard.events.deleteEvent.cancel'),
      });
    }
  };

  return (
    <FeatureFlag isFeatureEnabled={featureFlags.settingsScreenUsers}>
      <Form
        name="userAdd/Edit"
        initialValues={userData}
        form={formInstance}
        onFinish={onSaveHandler}
        layout="vertical"
        fields={[
          {
            name: 'firstName',
            value: userData.firstName,
          },
          {
            name: ['lastName'],
            value: userData.lastName,
          },
          {
            name: ['phoneNumber'],
            value: userData.phoneNumber,
          },
          {
            name: ['email'],
            value: userData.email,
          },
          {
            name: ['userType'],
            value: userData.userType,
          },
          { name: ['languagePreference'], value: userData.languagePreference },
        ]}>
        {(!isLoading || isUserFetchSuccess) && (
          <Row gutter={[0, 32]} className="add-edit-wrapper add-user-wrapper">
            <Col span={24}>
              <Row gutter={[0, 16]}>
                <Col span={24}>
                  <Row justify="space-between">
                    <Col className="breadcrumb">
                      <div className="button-container">
                        <Button
                          type="link"
                          onClick={() => navigate(-2)}
                          icon={<LeftOutlined style={{ marginRight: '17px' }} />}>
                          {t('dashboard.organization.createNew.search.breadcrumb')}
                        </Button>
                      </div>
                    </Col>
                    <Col>
                      <div className="add-event-button-wrap">
                        <Form.Item>
                          <PrimaryButton
                            label={t('dashboard.events.addEditEvent.saveOptions.save')}
                            htmlType="submit"
                          />
                        </Form.Item>
                      </div>
                    </Col>
                  </Row>
                </Col>
                <Col>
                  <div className="add-edit-event-heading">
                    <h4>
                      {isCurrentUser
                        ? t('dashboard.settings.addUser.userProfile')
                        : userId
                        ? t('dashboard.settings.addUser.editUser')
                        : t('dashboard.settings.addUser.newUser')}
                    </h4>
                  </div>
                </Col>
              </Row>
            </Col>
            <Col flex={'780px'}>
              <Card style={{ border: 'none', width: '100%' }}>
                <Row gutter={[0, 24]}>
                  <Col flex={'423px'}>
                    <div className="details-card-description">
                      {isCurrentUser
                        ? t('dashboard.settings.addUser.detailsCardDescriptionCurrentUser')
                        : userId
                        ? t('dashboard.settings.addUser.detailsCardDescriptionEditPage')
                        : t('dashboard.settings.addUser.detailsCardDescriptionAddPage')}
                    </div>
                  </Col>
                  <Col flex={'423px'}>
                    <Form.Item
                      name="firstName"
                      required
                      label={t('dashboard.settings.addUser.firstName')}
                      rules={[
                        {
                          validator: (_, value) =>
                            validateNotEmpty(_, value, t('dashboard.settings.addUser.validationTexts.firstName')),
                        },
                      ]}>
                      <Row>
                        <Col flex={'423px'}>
                          <AuthenticationInput
                            size="small"
                            placeholder={t('dashboard.settings.addUser.placeHolder.firstName')}
                            onChange={(e) => setFormItemValues({ value: e.target.value, fieldType: 'firstName' })}
                            value={userData.firstName}
                          />
                        </Col>
                      </Row>
                    </Form.Item>

                    <Form.Item
                      name="lastName"
                      required
                      label={t('dashboard.settings.addUser.lastName')}
                      rules={[
                        {
                          validator: (_, value) =>
                            validateNotEmpty(_, value, t('dashboard.settings.addUser.validationTexts.lastName')),
                        },
                      ]}>
                      <Row>
                        <Col flex={'423px'}>
                          <AuthenticationInput
                            size="small"
                            placeholder={t('dashboard.settings.addUser.placeHolder.lastName')}
                            onChange={(e) => setFormItemValues({ value: e.target.value, fieldType: 'lastName' })}
                            value={userData.lastName}
                          />
                        </Col>
                      </Row>
                    </Form.Item>
                    <Form.Item name="phoneNumber" label={t('dashboard.settings.addUser.phoneNumber')}>
                      <Row>
                        <Col flex={'423px'}>
                          <AuthenticationInput
                            size="small"
                            placeholder={t('dashboard.settings.addUser.placeHolder.phoneNumber')}
                            onChange={(e) => setFormItemValues({ value: e.target.value, fieldType: 'phoneNumber' })}
                            value={userData.phoneNumber}
                          />
                        </Col>
                      </Row>
                    </Form.Item>

                    <Form.Item
                      name="email"
                      required
                      label={t('dashboard.settings.addUser.email')}
                      rules={[
                        {
                          validator: (_, value) =>
                            validateNotEmpty(_, value, t('dashboard.settings.addUser.validationTexts.email')),
                        },
                      ]}>
                      <Row>
                        <Col flex={'423px'}>
                          <AuthenticationInput
                            size="small"
                            placeholder={t('dashboard.settings.addUser.placeHolder.email')}
                            onChange={(e) => setFormItemValues({ value: e.target.value, fieldType: 'email' })}
                            value={userData.email}
                          />
                        </Col>
                      </Row>
                    </Form.Item>

                    <Form.Item
                      name="userType"
                      required
                      label={t('dashboard.settings.addUser.userType')}
                      rules={[
                        {
                          validator: (_, value) =>
                            validateNotEmpty(_, value, t('dashboard.settings.addUser.validationTexts.userType')),
                        },
                      ]}>
                      <Row>
                        <Col flex={'423px'}>
                          <Dropdown
                            overlayClassName="add-user-form-field-dropdown-wrapper"
                            getPopupContainer={(trigger) => trigger.parentNode}
                            overlayStyle={{ minWidth: '100%' }}
                            disabled={!adminCheckHandler()}
                            menu={{
                              items: userRolesWithTranslation,
                              selectable: true,
                              onSelect: ({ selectedKeys }) => {
                                setFormItemValues({ value: selectedKeys[0], fieldType: 'userType' });
                              },
                            }}
                            trigger={['click']}>
                            <div>
                              <Typography.Text>
                                {userData?.userType !== ''
                                  ? userData?.userType
                                  : t('dashboard.settings.addUser.placeHolder.userType')}
                              </Typography.Text>
                              <DownOutlined style={{ fontSize: '16px' }} />
                            </div>
                          </Dropdown>
                        </Col>
                      </Row>
                    </Form.Item>

                    <Form.Item
                      name="languagePreference"
                      required
                      label={t('dashboard.settings.addUser.languagePreference')}
                      rules={[
                        {
                          validator: (_, value) =>
                            validateNotEmpty(_, value, t('dashboard.settings.addUser.validationTexts.language')),
                        },
                      ]}>
                      <Row>
                        <Col flex={'423px'}>
                          <Dropdown
                            overlayClassName="add-user-form-field-dropdown-wrapper"
                            getPopupContainer={(trigger) => trigger.parentNode}
                            overlayStyle={{
                              minWidth: '100%',
                            }}
                            menu={{
                              items: userLanguages,
                              selectable: true,
                              onSelect: ({ selectedKeys }) => {
                                const selectedLanguage = userLanguages.find((item) => item.key === selectedKeys[0]);
                                setFormItemValues({
                                  value: {
                                    key: selectedKeys[0],
                                    label: selectedLanguage.label,
                                  },
                                  fieldType: 'languagePreference',
                                });
                              },
                            }}
                            trigger={['click']}>
                            <div>
                              <Typography.Text>
                                {userData?.languagePreference?.label !== ''
                                  ? userData?.languagePreference?.label
                                  : t('dashboard.settings.addUser.placeHolder.language')}
                              </Typography.Text>
                              <DownOutlined style={{ fontSize: '16px' }} />
                            </div>
                          </Dropdown>
                        </Col>
                      </Row>
                    </Form.Item>

                    {isCurrentUser && (
                      <div className="password-modal">
                        <div className="button-container">
                          <OutlinedButton
                            label={t('dashboard.settings.addUser.passwordModal.btnText')}
                            size="middle"
                            style={{ height: '40px' }}
                            onClick={() => setIsPopoverOpen({ ...isPopoverOpen, password: true })}
                          />
                        </div>
                        <ChangePassword isPopoverOpen={isPopoverOpen} setIsPopoverOpen={setIsPopoverOpen} />
                      </div>
                    )}
                  </Col>
                </Row>
              </Card>
            </Col>
            {userId && selectedCalendars?.length > 0 && (
              <Col span={24}>
                <Row>
                  <Col flex={'780px'}>
                    <Card style={{ border: 'none' }}>
                      <Row>
                        <Col span={24} className="card-heading-container">
                          <h5>{t(`dashboard.settings.addUser.calendars`)}</h5>
                        </Col>
                      </Row>
                      <Row>
                        <Col flex={'423px'} className="calendar-search">
                          <Row gutter={[0, 4]}>
                            <Col flex={'423px'}>
                              <Col>
                                {selectedCalendars?.length > 0 &&
                                  selectedCalendars.map((item, index) => (
                                    <CalendarSelect
                                      key={index}
                                      icon={
                                        item?.image ? (
                                          <div className="image-container">
                                            <img src={item?.image.uri} />
                                          </div>
                                        ) : (
                                          <div className="icon-container">
                                            <CalendarOutlined style={{ color: '#607EFC', fontSize: '21px' }} />
                                          </div>
                                        )
                                      }
                                      name={contentLanguageBilingual({
                                        en: item?.name?.en,
                                        fr: item?.name?.fr,
                                        interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
                                        calendarContentLanguage: calendarContentLanguage,
                                      })}
                                      currentUser={isCurrentUser}
                                      itemWidth="100%"
                                      calendarContentLanguage={calendarContentLanguage}
                                      selectedCalendars={selectedCalendars}
                                      calenderItem={item}
                                      setSelectedCalendars={setSelectedCalendars}
                                      bordered
                                      closable
                                      userId={userId}
                                      isRoleOptionHidden={userId || isCurrentUser ? true : false}
                                      isCurrentUser
                                      onButtonClick={() => {
                                        removeCalendarHandler(index);
                                      }}
                                    />
                                  ))}
                              </Col>
                            </Col>
                          </Row>
                        </Col>
                      </Row>
                    </Card>
                  </Col>
                </Row>
              </Col>
            )}
          </Row>
        )}
      </Form>
    </FeatureFlag>
  );
};

export default AddUser;
