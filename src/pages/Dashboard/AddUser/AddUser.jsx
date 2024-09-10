import React, { useCallback, useRef } from 'react';
import { LeftOutlined, CloseCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { Button, Card, Col, Form, Input, message, notification, Popover, Row } from 'antd';
import PrimaryButton from '../../../components/Button/Primary';
import { createSearchParams, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import OutlinedButton from '../../..//components/Button/Outlined';
import { useTranslation } from 'react-i18next';
import FeatureFlag from '../../../layout/FeatureFlag/FeatureFlag';
import { featureFlags } from '../../../utils/featureFlags';
import './addUser.css';
import i18n from 'i18next';
import {
  useCurrentUserLeaveCalendarMutation,
  useLazyGetAllUsersQuery,
  useLazyGetCurrentUserQuery,
  useLazyGetUserByIdQuery,
  useUpdateCurrentUserMutation,
  useUpdateUserByIdMutation,
} from '../../../services/users';
import AuthenticationInput from '../../../components/Input/Common/AuthenticationInput';
import { userLanguages } from '../../../constants/userLanguagesÏ';
import { useState, useEffect } from 'react';
import { userRoles } from '../../../constants/userRoles';
import { useDispatch, useSelector } from 'react-redux';
import { clearUser, getUserDetails, setUser } from '../../../redux/reducer/userSlice';
import { contentLanguageBilingual } from '../../../utils/bilingual';
import { useOutletContext } from 'react-router-dom';
import ChangePassword from '../../../components/Modal/ChangePassword/ChangePassword';
import { useInviteUserMutation } from '../../../services/invite';
import { Confirm } from '../../../components/Modal/Confirm/Confirm';
import { setErrorStates } from '../../../redux/reducer/ErrorSlice';
import { useDebounce } from '../../../hooks/debounce';
import { SEARCH_DELAY } from '../../../constants/search';
import { PathName } from '../../../constants/pathName';
import { userActivityStatus } from '../../../constants/userActivityStatus';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { setReloadCalendar } from '../../../redux/reducer/selectedCalendarSlice';
import CalendarAccordion from '../../../components/Accordion/CalendarAccordion';
import { removeObjectArrayDuplicates } from '../../../utils/removeObjectArrayDuplicates';
import Select from '../../../components/Select';
import Cookies from 'js-cookie';
import { adminCheckHandler } from '../../../utils/adminCheckHandler';
import { RouteLeavingGuard } from '../../../hooks/usePrompt';

const AddUser = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { calendarId } = useParams();
  const location = useLocation();
  let [searchParams, setSearchParams] = useSearchParams();
  const [formInstance] = Form.useForm();
  const [
    currentCalendarData, // eslint-disable-next-line no-unused-vars
    _pageNumber, // eslint-disable-next-line no-unused-vars
    _setPageNumber, // eslint-disable-next-line no-unused-vars
    _getCalendar,
    setContentBackgroundColor, // eslint-disable-next-line no-unused-vars
    _isReadOnly, // eslint-disable-next-line no-unused-vars
    _setIsReadOnly, // eslint-disable-next-line no-unused-vars
    _refetch,
    allCalendarsData,
  ] = useOutletContext();
  setContentBackgroundColor('#F9FAFF');
  const userId = searchParams.get('id');
  const timestampRef = useRef(Date.now()).current;

  const calendarContentLanguage = currentCalendarData?.contentLanguage;

  const { accessToken, expiredTime, refreshToken, user } = useSelector(getUserDetails);

  const [isPopoverOpen, setIsPopoverOpen] = useState({
    organization: false,
    calendar: false,
    password: false,
    searchUserFirstName: false,
  });
  const [selectedCalendars, setSelectedCalendars] = useState([]);
  const [isFormDirty, setIsFormDirty] = useState(false);
  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    email: '',
    userType: '',
    languagePreference: '',
  });
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const [userSearchKeyword, setUserSearchKeyword] = useState('');
  const [userSearchData, setUserSearchData] = useState([]);

  const calendar = user?.roles?.filter((calendar) => {
    return calendar?.calendarId === calendarId;
  });

  const [getUser, { isFetching: isUserFetching }] = useLazyGetUserByIdQuery({ sessionId: timestampRef });
  const [getUserSearch] = useLazyGetAllUsersQuery({ sessionId: timestampRef });

  const [currentUserLeaveCalendar] = useCurrentUserLeaveCalendarMutation();
  const [inviteUser] = useInviteUserMutation();
  const [updateUserById] = useUpdateUserByIdMutation();
  const [getCurrentUserDetails, { isFetching: isCurrentUserFetching }] = useLazyGetCurrentUserQuery({
    sessionId: timestampRef,
  });
  const [updateCurrentUser] = useUpdateCurrentUserMutation();

  useEffect(() => {
    if (userId !== user?.id) {
      !adminCheckHandler({ calendar, user }) &&
        dispatch(setErrorStates({ errorCode: '403', isError: true, message: 'Forbidden resource.' }));
    } else {
      setIsCurrentUser(true);
    }

    if (userId && userId !== user?.id) {
      getUser({ userId, calendarId, sessionId: timestampRef })
        .unwrap()
        .then((response) => {
          const activeCalendars = response?.roles?.filter((r) => {
            return r.status === userActivityStatus[0].key || r.status === userActivityStatus[2].key;
          });
          setSelectedCalendars(
            activeCalendars
              ?.map((calendar) => ({
                ...calendar,
                disabled: calendarId === calendar?.calendarId ? false : true,
              }))
              .sort((a, b) => a.disabled - b.disabled),
          );
          const requiredRole = response?.roles.filter((r) => {
            return r.calendarId === calendarId;
          });

          setUserData({
            firstName: response?.firstName,
            lastName: response?.lastName,
            phoneNumber: response?.phoneNumber,
            email: response?.email,
            userType: requiredRole[0]?.role,
            languagePreference: response.interfaceLanguage,
            calendars: response.roles,
            ...response,
          });
        });
    } else if (userId && userId === user?.id) {
      getCurrentUserDetails({ accessToken: accessToken, calendarId: calendarId })
        .unwrap()
        .then((response) => {
          const activeCalendars = response?.roles.filter((r) => {
            return r.status == userActivityStatus[0].key || r.status == userActivityStatus[2].key;
          });
          setSelectedCalendars(
            activeCalendars
              ?.map((calendar) => ({
                ...calendar,
                disabled: false,
              }))
              .sort((a, b) => a.disabled - b.disabled),
          );
          const requiredRole = response?.roles.filter((r) => {
            return r.calendarId === calendarId;
          });
          setUserData({
            firstName: response?.firstName,
            lastName: response?.lastName,
            phoneNumber: response?.phoneNumber,
            email: response?.email,
            userType: requiredRole[0]?.role,
            languagePreference: response.interfaceLanguage,
            calendars: response.roles,
            ...response,
          });
        });
    } else if (!userId) {
      if (user?.isSuperAdmin) {
        setSelectedCalendars(
          allCalendarsData
            ?.map((calendar) => ({
              ...calendar,
              calendarId: calendar.id,
              disabled: calendarId === calendar?.id ? false : true,
              role: userRoles.GUEST,
            }))
            .sort((a, b) => a.disabled - b.disabled),
        );
      } else
        getCurrentUserDetails({ accessToken: accessToken, calendarId: calendarId })
          .unwrap()
          .then((response) => {
            setSelectedCalendars(
              response?.roles
                .map((calendar) => ({
                  ...calendar,
                  disabled: calendarId === calendar?.calendarId ? false : true,
                }))
                .sort((a, b) => a.disabled - b.disabled),
            );
          });
    } else if (location.state?.data) {
      setSearchParams(createSearchParams({ id: location.state.data.id }));
    }
  }, [userId, allCalendarsData]);

  useEffect(() => {
    if (userId) {
      formInstance.setFieldsValue({
        firstName: userData.firstName,
        lastName: userData.lastName,
        phoneNumber: userData.phoneNumber,
        email: userData.email,
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

  const onSearchCardClick = (item) => {
    setUserSearchKeyword(item?.firstName);
    getUser({ userId: item?._id, calendarId })
      .unwrap()
      .then((response) => {
        let activeCalendars = response?.roles.filter((r) => {
          return r.status == userActivityStatus[0].key;
        });
        const currentCalendarRole = {
          calendarId: currentCalendarData?.id,
          image: currentCalendarData?.image,
          name: currentCalendarData?.name,
          role: userRoles.GUEST,
        };
        activeCalendars = [...activeCalendars, currentCalendarRole];
        activeCalendars = removeObjectArrayDuplicates(activeCalendars, 'calendarId');

        setSelectedCalendars(
          activeCalendars
            ?.map((calendar) => ({
              ...calendar,
              disabled: calendarId === calendar?.calendarId ? false : true,
            }))
            .sort((a, b) => a.disabled - b.disabled),
        );

        setUserData({
          firstName: response?.firstName,
          lastName: response?.lastName,
          phoneNumber: response?.phoneNumber,
          email: response?.email,
          languagePreference: response.interfaceLanguage,
          calendars: response.roles,
          ...response,
        });
      });
  };

  const onSaveHandler = () => {
    if (!userId) {
      formInstance
        .validateFields()
        .then((values) => {
          setIsFormDirty(false);
          let organizations = values?.organizers[calendarId];
          organizations = organizations?.map((organizer) => {
            return { entityId: organizer?.value };
          });

          let people = values?.people[calendarId];
          people = people?.map((organizer) => {
            return { entityId: organizer?.value };
          });
          let userType = values?.userType[calendarId];
          inviteUser({
            firstName: values.firstName?.trim(),
            lastName: values.lastName?.trim(),
            email: values.email,
            role: userType,
            language: values?.languagePreference,
            calendarId,
            organizationIds: organizations,
            peopleIds: people,
          }).then((res) => {
            if (res?.data?.statusCode == 202) {
              notification.success({
                description: t(`dashboard.settings.addUser.notification.invitation`),
                key: res.message,
                placement: 'top',
                closeIcon: <></>,
                maxCount: 1,
                duration: 3,
              });
            }
            navigate(-2);
          });
        })
        .catch((errors) => {
          notification.success({
            description: errors.message,
            key: errors.message,
            placement: 'top',
            closeIcon: <></>,
            maxCount: 1,
            duration: 3,
          });
        });
    } else if (userId) {
      formInstance
        .validateFields()
        .then((values) => {
          setIsFormDirty(false);
          let organizations = values?.organizers?.[calendarId] ?? [];
          organizations = organizations.map((organizer) => {
            return { entityId: organizer?.value };
          });

          let people = values?.people?.[calendarId] ?? [];
          people = people.map((organizer) => {
            return { entityId: organizer?.value };
          });

          let userType = values?.userType?.[calendarId] ?? [];
          if (isCurrentUser && adminCheckHandler({ calendar, user }) == false) {
            updateCurrentUser({
              calendarId,
              body: {
                firstName: values?.firstName?.trim(),
                lastName: values?.lastName?.trim(),
                email: values?.email,
                interfaceLanguage: values?.languagePreference,
              },
            })
              .unwrap()
              .then((response) => {
                if (response?.statusCode == 202) {
                  i18n.changeLanguage(values?.languagePreference?.toLowerCase());
                  getCurrentUserDetails({ accessToken: accessToken, calendarId: calendarId })
                    .unwrap()
                    .then((response) => {
                      const requiredRole = response?.roles.filter((r) => {
                        return r.calendarId === calendarId;
                      });

                      setUserData({
                        firstName: response?.firstName,
                        lastName: response?.lastName,
                        phoneNumber: response?.phoneNumber,
                        email: response?.email,
                        userType: requiredRole[0]?.role,
                        userName: response?.userName,
                        languagePreference: response.interfaceLanguage,
                        calendars: response.roles,
                      });
                      let userDetails = {
                        accessToken,
                        expiredTime,
                        refreshToken,
                        user: {
                          id: response?.id,
                          firstName: response?.firstName,
                          lastName: response?.lastName,
                          email: response?.email,
                          profileImage: response?.profileImage,
                          roles: response?.roles,
                          isSuperAdmin: response?.isSuperAdmin ? true : false,
                          userName: response?.userName,
                          interfaceLanguage: response?.interfaceLanguage,
                        },
                      };
                      dispatch(setUser(userDetails));
                      Cookies.set('interfaceLanguage', response?.interfaceLanguage?.toLowerCase());
                    });
                  notification.success({
                    description: t('dashboard.userProfile.notification.profileUpdate'),
                    placement: 'top',
                    closeIcon: <></>,
                    maxCount: 1,
                    duration: 3,
                  });

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
          } else if (adminCheckHandler({ calendar, user })) {
            updateUserById({
              id: userId,
              calendarId,
              body: {
                firstName: values.firstName?.trim(),
                lastName: values.lastName?.trim(),
                email: values.email,
                interfaceLanguage: values?.languagePreference,
                modifyRole: {
                  userId: userId,
                  role: userType,
                  calendarId,
                  organizations,
                  people,
                },
              },
            })
              .unwrap()
              .then((res) => {
                if (isCurrentUser) {
                  i18n.changeLanguage(values?.languagePreference?.toLowerCase());
                  getCurrentUserDetails({ accessToken: accessToken, calendarId: calendarId })
                    .unwrap()
                    .then((response) => {
                      const requiredRole = response?.roles.filter((r) => {
                        return r.calendarId === calendarId;
                      });
                      setUserData({
                        firstName: response?.firstName,
                        lastName: response?.lastName,
                        phoneNumber: response?.phoneNumber,
                        email: response?.email,
                        userType: requiredRole?.length > 0 && requiredRole[0]?.role,
                        userName: response?.userName,
                        languagePreference: response.interfaceLanguage,
                        calendars: response.roles,
                      });
                      notification.success({
                        description: t(`dashboard.settings.addUser.notification.updateUser`),
                        key: res.message,
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
                          id: response?.id,
                          firstName: response?.firstName,
                          lastName: response?.lastName,
                          email: response?.email,
                          profileImage: response?.profileImage,
                          roles: response?.roles,
                          isSuperAdmin: response?.isSuperAdmin ? true : false,
                          userName: response?.userName,
                          interfaceLanguage: response?.interfaceLanguage,
                        },
                      };
                      dispatch(setUser(userDetails));
                      Cookies.set('interfaceLanguage', response?.interfaceLanguage?.toLowerCase());

                      navigate(-2);
                    });
                } else {
                  notification.success({
                    description: t(`dashboard.settings.addUser.notification.updateUser`),
                    key: res.message,
                    placement: 'top',
                    closeIcon: <></>,
                    maxCount: 1,
                    duration: 3,
                  });
                  navigate(-2);
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
          }
        })
        .catch((errors) => {
          console.error('Validation errors:', errors);
        });
    }
  };

  const setFormItemValues = ({ value, fieldType }) => {
    setUserData({ ...userData, [fieldType]: value });
  };

  const searchHandlerUserSearch = (value) => {
    value != ''
      ? getUserSearch({ includeCalenderFilter: false, calendarId, query: value, page: 1, limit: 10, filters: '' })
          .unwrap()
          .then((res) => {
            setUserSearchData(res);
          })
      : setUserSearchData([]);
  };

  const debounceSearch = useCallback(useDebounce(searchHandlerUserSearch, SEARCH_DELAY), []);

  const removeCalendarHandler = ({ item, index }) => {
    if (isCurrentUser) {
      Confirm({
        title: t('dashboard.settings.addUser.confirmLeave'),
        onAction: () => {
          isCurrentUser &&
            currentUserLeaveCalendar({ calendarId: item?.calendarId })
              .unwrap()
              .then(() => {
                if (selectedCalendars.length <= 1) {
                  dispatch(clearUser());
                  navigate(PathName.Login, { state: { previousPath: 'logout' } });
                }
                setSelectedCalendars((prevState) => {
                  const updatedArray = prevState.filter((_, i) => index !== i);
                  if (calendarId === item.calendarId) {
                    const newcalendar = userData.calendars.filter((i) => i.calendarId != item.calendarId);
                    navigate(`${PathName.Dashboard}/${newcalendar[0].calendarId}${PathName.Events}`);
                  }
                  return updatedArray;
                });
                dispatch(setReloadCalendar(true));
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

  const setRouteBlockingFlag = () => {
    if (!isFormDirty) setIsFormDirty(true);
  };

  return (
    <FeatureFlag isFeatureEnabled={featureFlags.settingsScreenUsers}>
      <RouteLeavingGuard isBlocking={isFormDirty} />
      <Form
        name="userAdd/Edit"
        initialValues={userData}
        form={formInstance}
        onValuesChange={setRouteBlockingFlag}
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
          { name: ['languagePreference'], value: userData.languagePreference },
        ]}>
        {!(isUserFetching || isCurrentUserFetching) ? (
          <Row gutter={[0, 32]} className="add-edit-wrapper add-user-wrapper">
            <Col span={24}>
              <Row gutter={[0, 16]}>
                <Col span={24}>
                  <Row justify="space-between">
                    <Col className="breadcrumb">
                      <div className="button-container">
                        <Button
                          data-cy="button-user-back-to-previous"
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
                            data-cy="button-user-save"
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
                    <h4 data-cy="heading-user-profile-edit-add">
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
                    <div className="details-card-description" data-cy="div-user-profile-edit-add-page">
                      {isCurrentUser
                        ? t('dashboard.settings.addUser.detailsCardDescriptionCurrentUser')
                        : userId
                        ? t('dashboard.settings.addUser.detailsCardDescriptionEditPage')
                        : t('dashboard.settings.addUser.detailsCardDescriptionAddPage')}
                    </div>
                  </Col>
                  <Col flex={'423px'}>
                    <Form.Item
                      data-cy="form-item-user-first-name-title"
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
                          {userId ? (
                            <AuthenticationInput
                              size="small"
                              placeholder={t('dashboard.settings.addUser.placeHolder.firstName')}
                              onChange={(e) => setFormItemValues({ value: e.target.value, fieldType: 'firstName' })}
                              value={userData.firstName}
                            />
                          ) : (
                            <>
                              <div className="search-bar-organization">
                                <Popover
                                  open={
                                    userSearchData?.data?.length > 0 &&
                                    isPopoverOpen?.searchUserFirstName &&
                                    userSearchKeyword != ''
                                  }
                                  arrow={false}
                                  overlayClassName="entity-popover"
                                  placement="bottom"
                                  onOpenChange={(open) => {
                                    setIsPopoverOpen({ ...isPopoverOpen, searchUserFirstName: open });
                                    if (userSearchKeyword != '') {
                                      debounceSearch(userSearchKeyword);
                                    }
                                  }}
                                  autoAdjustOverflow={false}
                                  getPopupContainer={(trigger) => trigger.parentNode}
                                  trigger={['focus']}
                                  content={
                                    <div>
                                      <div className="search-scrollable-content">
                                        {userSearchData?.data?.map((item, index) => (
                                          <div
                                            key={index}
                                            className="search-popover-options"
                                            onClick={() => {
                                              setIsPopoverOpen({ ...isPopoverOpen, searchUserFirstName: false });
                                              onSearchCardClick(item);
                                            }}>
                                            <p>{item?.firstName + ' ' + item?.lastName}</p>
                                            <p>{item?.email}</p>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  }>
                                  <Input
                                    style={{ borderRadius: '4px' }}
                                    placeholder={t('dashboard.settings.addUser.placeHolder.firstName')}
                                    value={userSearchKeyword}
                                    onPressEnter={(e) => {
                                      e.preventDefault();
                                      setIsPopoverOpen({ ...isPopoverOpen, searchUserFirstName: false });
                                      e.target.blur();
                                    }}
                                    onFocus={(e) => {
                                      if (e.target.value != '') {
                                        if (userSearchData?.data?.length > 0) {
                                          setIsPopoverOpen({ ...isPopoverOpen, searchUserFirstName: true });
                                          debounceSearch(e.target.value);
                                        }
                                      }
                                    }}
                                    onClick={(e) => {
                                      if (e.target.value != '') {
                                        if (userSearchData?.data?.length > 0) {
                                          setIsPopoverOpen({ ...isPopoverOpen, searchUserFirstName: true });
                                        }
                                        debounceSearch(e.target.value);
                                      }
                                    }}
                                    onChange={(e) => {
                                      setFormItemValues({ value: e.target.value, fieldType: 'firstName' });
                                      setUserSearchKeyword(e.target.value);

                                      if (e.target.value == '') {
                                        setUserSearchData([]);
                                      } else {
                                        debounceSearch(e.target.value);
                                      }
                                    }}
                                    className="events-search"
                                  />
                                </Popover>
                              </div>
                            </>
                          )}
                        </Col>
                      </Row>
                    </Form.Item>

                    <Form.Item
                      data-cy="form-item-user-last-name-title"
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
                    <Form.Item
                      data-cy="form-item-user-phonenumber-title"
                      name="phoneNumber"
                      label={t('dashboard.settings.addUser.phoneNumber')}
                      rules={[
                        {
                          pattern: /^\d+$/,
                          message: 'Phone number must be a number!',
                        },
                      ]}>
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
                      data-cy="form-item-user-email-title"
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
                      data-cy="form-item-user-language-title"
                      name="languagePreference"
                      required
                      label={t('dashboard.settings.addUser.languagePreference')}
                      rules={[
                        {
                          validator: (_, value) =>
                            validateNotEmpty(_, value, t('dashboard.settings.addUser.validationTexts.language')),
                        },
                      ]}>
                      <Select
                        options={userLanguages}
                        onChange={(value) => setFormItemValues({ value, fieldType: 'languagePreference' })}
                        data-cy="select-user-language"
                      />
                    </Form.Item>

                    {isCurrentUser && (
                      <div className="password-modal">
                        <div className="button-container">
                          <OutlinedButton
                            data-cy="button-changepassword"
                            label={t('dashboard.settings.addUser.passwordModal.btnText')}
                            size="large"
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
            {selectedCalendars?.length > 0 && (
              <Col span={24}>
                <Row>
                  <Col flex={'780px'}>
                    <Card style={{ border: 'none' }}>
                      <Row>
                        <Col span={24} className="card-heading-container">
                          <h5 data-cy="heading-user-calendars">{t(`dashboard.settings.addUser.calendars`)}</h5>
                        </Col>
                      </Row>
                      <Row>
                        <Col flex={'423px'} className="calendar-search">
                          <Row gutter={[0, 4]}>
                            <Col flex={'423px'}>
                              <Col>
                                <div style={{ display: 'flex', gap: '16px', flexDirection: 'column' }}>
                                  {selectedCalendars?.map((selectedCalendar, index) => (
                                    <CalendarAccordion
                                      form={formInstance}
                                      data-cy="accordion-selected-calendars"
                                      key={index}
                                      setRouteBlockingFlag={setRouteBlockingFlag}
                                      selectedCalendarId={selectedCalendar?.calendarId}
                                      name={contentLanguageBilingual({
                                        en: selectedCalendar?.name?.en,
                                        fr: selectedCalendar?.name?.fr,
                                        interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
                                        calendarContentLanguage: calendarContentLanguage,
                                      })}
                                      role={selectedCalendar?.role}
                                      readOnly={adminCheckHandler({ calendar, user }) ? false : true}
                                      disabled={selectedCalendar?.disabled}
                                      organizationIds={selectedCalendar?.organizations}
                                      peopleIds={selectedCalendar?.people}
                                      isCurrentUser={isCurrentUser}
                                      removeCalendarHandler={() => {
                                        removeCalendarHandler({ item: selectedCalendar, index });
                                      }}
                                    />
                                  ))}
                                </div>
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
        ) : (
          <div style={{ height: 400, width: '100%', display: 'grid', placeContent: 'center' }}>
            <LoadingIndicator data-cy="loading-indicator-user" />
          </div>
        )}
      </Form>
    </FeatureFlag>
  );
};

export default AddUser;
