import React, { useRef } from 'react';
import { LeftOutlined, CalendarOutlined } from '@ant-design/icons';
import { Button, Card, Col, Dropdown, Form, Row, Typography } from 'antd';
import PrimaryButton from '../../../components/Button/Primary';
import { createSearchParams, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import OutlinedButton from '../../..//components/Button/Outlined';
import { useTranslation } from 'react-i18next';
import FeatureFlag from '../../../layout/FeatureFlag/FeatureFlag';
import { featureFlags } from '../../../utils/featureFlags';
import './addUser.css';
import { DownOutlined } from '@ant-design/icons';
import {
  useCurrentUserLeaveCalendarMutation,
  useDeleteUserMutation,
  useLazyGetUserByIdQuery,
  useUpdateUserByIdMutation,
} from '../../../services/users';
import AuthenticationInput from '../../../components/Input/Common/AuthenticationInput';
import { userLanguages } from '../../../constants/userLanguagesÏ';
import { useState, useEffect } from 'react';
import { userRoles, userRolesWithTranslation } from '../../../constants/userRoles';
import { useLazyGetAllOrganizationQuery } from '../../../services/organization';
import { ReactComponent as OrganizationLogo } from '../../../assets/icons/organization-light.svg';
import { useSelector } from 'react-redux';
import { getUserDetails } from '../../../redux/reducer/userSlice';
import { Popover } from 'antd';
import { contentLanguageBilingual } from '../../../utils/bilingual';
import { useOutletContext } from 'react-router-dom';
import NoContent from '../../../components/NoContent/NoContent';
import ListCard from '../../../components/Card/User/ListCard';
import EventsSearch from '../../../components/Search/Events/EventsSearch';
import LoadingIndicator from '../../../components/LoadingIndicator';
import SelectionItem from '../../../components/List/SelectionItem';
import { useLazyGetAllCalendarsQuery } from '../../../services/calendar';
import CalendarSelect from '../../../components/List/User/CalenderSelect/CalendarSelect';
import ChangePassword from '../../../components/Modal/ChangePassword/ChangePassword';
import { useInviteUserMutation } from '../../../services/invite';

const AddUser = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { calendarId } = useParams();
  const location = useLocation();
  let [searchParams, setSearchParams] = useSearchParams();
  const [formInstance] = Form.useForm();
  const timestampRef = useRef(Date.now()).current;
  const [currentCalendarData] = useOutletContext();

  const calendarContentLanguage = currentCalendarData?.contentLanguage;

  const { user } = useSelector(getUserDetails);

  const [isPopoverOpen, setIsPopoverOpen] = useState({ organization: false, calendar: false, password: false });
  const [selectedOrganization, setSelectedOrganization] = useState([]);
  const [selectedCalendars, setSelectedCalendars] = useState([]);
  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    email: '',
    userType: '',
    languagePreference: '',
  });
  const [filteredCalendarData, setFilteredCalendarData] = useState([]);
  const [organizationSearchQuery, setOrganizationSearchQuery] = useState('');
  const [calendarSearchQuery, setCalendarSearchQuery] = useState('');
  const [isCurrentUser, setIsCurrentUser] = useState(false);

  const calendar = user?.roles.filter((calendar) => {
    return calendar.calendarId === calendarId;
  });
  const userId = searchParams.get('id');

  const [getUser, { isFetching: isLoading, isSuccess: isUserFetchSuccess }] = useLazyGetUserByIdQuery();
  const [getOrganizations, { currentData: organizationData, isFetching: isOrganizationsLoading }] =
    useLazyGetAllOrganizationQuery();
  const [
    getAllCalendars,
    { currentData: calendarData, isFetching: isCalendarsLoading, isSuccess: isCalendarFetchSuccess },
  ] = useLazyGetAllCalendarsQuery();
  const [
    currentUserLeaveCalendar,
    // { isSuccess: isCurrentUserLeaveCalendarSuccess, isError: isCurrentUserLeaveCalendarError },
  ] = useCurrentUserLeaveCalendarMutation();
  const [deleteUser] = useDeleteUserMutation();
  const [inviteUser] = useInviteUserMutation();
  const [updateUserById] = useUpdateUserByIdMutation();

  useEffect(() => {
    if (userId) {
      userId === user?.id && setIsCurrentUser(true);

      getUser({ userId, calendarId })
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
            languagePreference: response.interfaceLanguage,
            calendars: response.roles,
          });
        });
    } else if (location.state?.data) {
      setSearchParams(createSearchParams({ id: location.state.data.id }));
    }

    getOrganizations({
      calendarId,
      sessionId: timestampRef,
      query: '',
      sort: `sort=asc(name.${user?.interfaceLanguage.toLowerCase()})`,
    });
    getAllCalendars();
  }, [userId]);

  useEffect(() => {
    if (calendarData?.data && isUserFetchSuccess && userData) {
      // for edit user
      const subscribedCalendars = calendarData?.data.filter((item) => {
        return userData?.calendars?.some((i) => item.id === i.calendarId);
      });

      setSelectedCalendars([...subscribedCalendars]);

      setFilteredCalendarData([...calendarData.data]);
    } else if (calendarData?.data && !userId) {
      // for new users
      setFilteredCalendarData([...calendarData.data]);
    }
  }, [calendarData, isUserFetchSuccess]);

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

  useEffect(() => {
    if (organizationSearchQuery !== '') {
      getOrganizations({
        calendarId,
        sessionId: timestampRef,
        query: organizationSearchQuery,
        sort: `sort=asc(name.${user?.interfaceLanguage.toLowerCase()})`,
      });
    }
  }, [organizationSearchQuery]);

  useEffect(() => {
    const filteredData = calendarData?.data.filter((item) => {
      const name = contentLanguageBilingual({
        en: item?.name?.en,
        fr: item?.name?.fr,
        interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
        calendarContentLanguage: calendarContentLanguage,
      });
      if (name.toLowerCase().includes(calendarSearchQuery.toLowerCase())) {
        return item;
      }
    });
    if (filteredData) {
      setFilteredCalendarData([...filteredData]);
    } else {
      setFilteredCalendarData([]);
    }
  }, [calendarSearchQuery]);

  // handlers

  const validateNotEmpty = (_, value) => {
    if (value === '') {
      return Promise.reject(new Error('This field is required.'));
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
          selectedCalendars.map((item) => {
            inviteUser({
              firstName: values.firstName,
              lastName: values.lastName,
              email: values.email,
              role: values.userType,
              calendarId: item.id,
            });
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
          updateUserById({
            id: userId,
            calendarId,
            body: {
              firstName: values.firstName,
              lastName: values.lastName,
              email: values.email,
              interfaceLanguage: values.languagePreference,
              modifyRole: {
                userId: userId,
                role: values.userType,
                calendarId,
              },
            },
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
    setSelectedCalendars((prevState) => {
      const updatedArray = prevState.filter((_, i) => index !== i);
      return updatedArray;
    });
    formInstance.setFieldValue('calendars', selectedCalendars);

    if (isCurrentUser) {
      currentUserLeaveCalendar({ calendarId });
    } else {
      deleteUser({ id: userId, calendarId: calendarId });
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
                    <Col>
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
            <Col span={24}>
              <Row>
                <Col span={16}>
                  <Card>
                    <Row gutter={[0, 24]}>
                      <Col>
                        <div className="details-card-description">
                          {isCurrentUser
                            ? t('dashboard.settings.addUser.detailsCardDescriptionCurrentUser')
                            : userId
                            ? t('dashboard.settings.addUser.detailsCardDescriptionAddPage')
                            : t('dashboard.settings.addUser.detailsCardDescriptionEditPage')}
                        </div>
                      </Col>
                      <Col>
                        <Form.Item
                          name="firstName"
                          required
                          label={t('dashboard.settings.addUser.firstName')}
                          rules={[
                            {
                              validator: validateNotEmpty,
                            },
                          ]}>
                          <Row>
                            <Col span={19}>
                              <AuthenticationInput
                                size="small"
                                placeholder={t('dashboard.events.filter.users.placeholderSearch')}
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
                              validator: validateNotEmpty,
                            },
                          ]}>
                          <Row>
                            <Col span={19}>
                              <AuthenticationInput
                                size="small"
                                placeholder={t('dashboard.events.filter.users.placeholderSearch')}
                                onChange={(e) => setFormItemValues({ value: e.target.value, fieldType: 'lastName' })}
                                value={userData.lastName}
                              />
                            </Col>
                          </Row>
                        </Form.Item>
                        <Form.Item name="phoneNumber" label={t('dashboard.settings.addUser.phoneNumber')}>
                          <Row>
                            <Col span={19}>
                              <AuthenticationInput
                                size="small"
                                placeholder={t('dashboard.events.filter.users.placeholderSearch')}
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
                              validator: validateNotEmpty,
                            },
                          ]}>
                          <Row>
                            <Col span={19}>
                              <AuthenticationInput
                                size="small"
                                placeholder={t('dashboard.events.filter.users.placeholderSearch')}
                                onChange={(e) => setFormItemValues({ value: e.target.value, fieldType: 'email' })}
                                value={userData.email}
                              />
                            </Col>
                          </Row>
                        </Form.Item>

                        {adminCheckHandler() && (
                          <Form.Item
                            name="userType"
                            required
                            label={t('dashboard.settings.addUser.userType')}
                            rules={[
                              {
                                validator: validateNotEmpty,
                              },
                            ]}>
                            <Row>
                              <Col span={19}>
                                <Dropdown
                                  overlayClassName="add-user-form-field-dropdown-wrapper"
                                  getPopupContainer={(trigger) => trigger.parentNode}
                                  overlayStyle={{ minWidth: '100%' }}
                                  menu={{
                                    items: userRolesWithTranslation,
                                    selectable: true,
                                    onSelect: ({ selectedKeys }) => {
                                      setFormItemValues({ value: selectedKeys[0], fieldType: 'userType' });
                                    },
                                  }}
                                  trigger={['click']}>
                                  <div
                                    style={{
                                      padding: userData?.userType === '' && '15px',
                                    }}>
                                    <Typography.Text>{userData?.userType}</Typography.Text>
                                    <DownOutlined style={{ fontSize: '16px' }} />
                                  </div>
                                </Dropdown>
                              </Col>
                            </Row>
                          </Form.Item>
                        )}

                        <Form.Item
                          name="languagePreference"
                          required
                          label={t('dashboard.settings.addUser.languagePreference')}
                          rules={[
                            {
                              validator: validateNotEmpty,
                            },
                          ]}>
                          <Row>
                            <Col span={19}>
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
                                    setFormItemValues({ value: selectedKeys[0], fieldType: 'languagePreference' });
                                  },
                                }}
                                trigger={['click']}>
                                <div
                                  style={{
                                    padding: userData?.languagePreference === '' && '15px',
                                  }}>
                                  <Typography.Text>{userData?.languagePreference}</Typography.Text>
                                  <DownOutlined style={{ fontSize: '16px' }} />
                                </div>
                              </Dropdown>
                            </Col>
                          </Row>
                        </Form.Item>

                        <Form.Item label={t('dashboard.settings.addUser.organization')}>
                          <Row gutter={[0, 4]}>
                            <Col span={19}>
                              <div className="details-card-description">
                                {t('dashboard.settings.addUser.organizationSearchDescription')}
                              </div>
                            </Col>
                            <Col span={19} className="organization-search">
                              <div className="search-bar-organization">
                                <Popover
                                  open={isPopoverOpen.organization}
                                  arrow={false}
                                  overlayClassName="entity-popover"
                                  placement="bottom"
                                  onOpenChange={(open) => {
                                    setIsPopoverOpen({ ...isPopoverOpen, organization: open });
                                  }}
                                  autoAdjustOverflow={false}
                                  getPopupContainer={(trigger) => trigger.parentNode}
                                  trigger={['click']}
                                  content={
                                    <div>
                                      {!isOrganizationsLoading ? (
                                        <div className="search-scrollable-content">
                                          {organizationData?.data?.length > 0 ? (
                                            organizationData?.data?.map((item, index) => (
                                              <div
                                                key={index}
                                                className="search-popover-options"
                                                onClick={() => {
                                                  setIsPopoverOpen({ ...isPopoverOpen, organization: false });
                                                }}>
                                                <ListCard
                                                  title={contentLanguageBilingual({
                                                    en: item?.name?.en,
                                                    fr: item?.name?.fr,
                                                    interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
                                                    calendarContentLanguage: calendarContentLanguage,
                                                  })}
                                                  description={contentLanguageBilingual({
                                                    en: item?.disambiguatingDescription?.en,
                                                    fr: item?.disambiguatingDescription?.fr,
                                                    interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
                                                    calendarContentLanguage: calendarContentLanguage,
                                                  })}
                                                  onClick={() => {
                                                    let flag = false;
                                                    selectedCalendars.map((i) => {
                                                      if (i.id === item.id) {
                                                        flag = true;
                                                      }
                                                    });
                                                    !flag && setSelectedOrganization([...selectedOrganization, item]);
                                                  }}
                                                  Logo={
                                                    item?.logo ? (
                                                      <div className="image-container">
                                                        <img src={item?.logo?.thumbnail?.uri} />
                                                      </div>
                                                    ) : (
                                                      <div className="image-container">
                                                        <OrganizationLogo />
                                                      </div>
                                                    )
                                                  }
                                                />
                                              </div>
                                            ))
                                          ) : (
                                            <NoContent />
                                          )}
                                        </div>
                                      ) : (
                                        <Row
                                          justify="center"
                                          align="middle"
                                          style={{ height: '96px', padding: '12px' }}>
                                          <LoadingIndicator />
                                        </Row>
                                      )}
                                    </div>
                                  }>
                                  <EventsSearch
                                    style={{ borderRadius: '4px' }}
                                    placeholder="Search organizations"
                                    onClick={(e) => {
                                      setOrganizationSearchQuery(e.target.value);
                                      setIsPopoverOpen({ ...isPopoverOpen, organization: true });
                                    }}
                                    onChange={(e) => {
                                      setOrganizationSearchQuery(e.target.value);
                                      setIsPopoverOpen({ ...isPopoverOpen, organization: true });
                                    }}
                                  />
                                </Popover>
                              </div>
                            </Col>
                            <Col span={19}>
                              {selectedOrganization?.length > 0 &&
                                selectedOrganization.map((item, index) => (
                                  <SelectionItem
                                    key={index}
                                    icon={
                                      item?.logo ? (
                                        <div className="image-container">
                                          <img src={item?.logo?.thumbnail?.uri} />
                                        </div>
                                      ) : (
                                        <div className="image-container">
                                          <OrganizationLogo />
                                        </div>
                                      )
                                    }
                                    name={contentLanguageBilingual({
                                      en: item?.name?.en,
                                      fr: item?.name?.fr,
                                      interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
                                      calendarContentLanguage: calendarContentLanguage,
                                    })}
                                    description={
                                      contentLanguageBilingual({
                                        en: item?.disambiguatingDescription?.en,
                                        fr: item?.disambiguatingDescription?.fr,
                                        interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
                                        calendarContentLanguage: calendarContentLanguage,
                                      }) || ''
                                    }
                                    itemWidth="100%"
                                    calendarContentLanguage={calendarContentLanguage}
                                    bordered
                                    closable
                                    onClose={() => {
                                      setSelectedOrganization((prevState) => {
                                        const updatedArray = prevState.filter((_, i) => index !== i);
                                        return updatedArray;
                                      });
                                      formInstance.setFieldValue('organizations', selectedOrganization);
                                    }}
                                  />
                                ))}
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
              </Row>
            </Col>
            <Col span={24}>
              <Row>
                <Col span={16}>
                  <Card>
                    <Row>
                      <Col span={24} className="card-heading-container">
                        <h5>{t(`dashboard.settings.addUser.calendars`)}</h5>
                      </Col>
                    </Row>
                    <Row>
                      <Col span={24} className="calendar-search">
                        <Row gutter={[0, 4]}>
                          <Col span={24}>
                            <Form.Item label={t('dashboard.settings.addUser.calendarSearchHeading')}>
                              <Col span={24}>
                                <div className="details-card-description">
                                  {t('dashboard.settings.addUser.calendarsDescription')}
                                </div>
                              </Col>
                              <Col span={19} className="organization-search">
                                <div className="search-bar-organization">
                                  <Popover
                                    open={isPopoverOpen.calendar}
                                    arrow={false}
                                    overlayClassName="entity-popover"
                                    placement="bottom"
                                    onOpenChange={(open) => {
                                      setIsPopoverOpen({ ...isPopoverOpen, calendar: open });
                                    }}
                                    autoAdjustOverflow={false}
                                    getPopupContainer={(trigger) => trigger.parentNode}
                                    trigger={['click']}
                                    content={
                                      <div>
                                        {!isCalendarsLoading || isCalendarFetchSuccess ? (
                                          <div className="search-scrollable-content">
                                            {filteredCalendarData?.length > 0 ? (
                                              filteredCalendarData?.map((item, index) => (
                                                <div
                                                  key={index}
                                                  className="search-popover-options"
                                                  onClick={() => {
                                                    setIsPopoverOpen({ ...isPopoverOpen, calendar: false });
                                                  }}>
                                                  <ListCard
                                                    title={contentLanguageBilingual({
                                                      en: item?.name?.en,
                                                      fr: item?.name?.fr,
                                                      interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
                                                      calendarContentLanguage: calendarContentLanguage,
                                                    })}
                                                    onClick={() => {
                                                      let flag = false;
                                                      selectedCalendars.map((i) => {
                                                        if (i.id === item.id) {
                                                          flag = true;
                                                        }
                                                      });
                                                      !flag && setSelectedCalendars([...selectedCalendars, item]);
                                                    }}
                                                    Logo={
                                                      item?.image ? (
                                                        <div className="image-container">
                                                          <img src={item?.image.uri} />
                                                        </div>
                                                      ) : (
                                                        <div className="icon-container">
                                                          <CalendarOutlined
                                                            style={{ color: '#607EFC', fontSize: '21px' }}
                                                          />
                                                        </div>
                                                      )
                                                    }
                                                  />
                                                </div>
                                              ))
                                            ) : (
                                              <NoContent />
                                            )}
                                          </div>
                                        ) : (
                                          <Row
                                            justify="center"
                                            align="middle"
                                            style={{ height: '96px', padding: '12px' }}>
                                            <LoadingIndicator />
                                          </Row>
                                        )}
                                      </div>
                                    }>
                                    <EventsSearch
                                      style={{ borderRadius: '4px' }}
                                      placeholder="Search organizations"
                                      onClick={(e) => {
                                        const value = e.target.value;
                                        setCalendarSearchQuery(value);
                                        setIsPopoverOpen({ ...isPopoverOpen, calendar: true });
                                      }}
                                      onChange={(e) => {
                                        const value = e.target.value;
                                        setCalendarSearchQuery(value);
                                        setIsPopoverOpen({ ...isPopoverOpen, calendar: true });
                                      }}
                                    />
                                  </Popover>
                                </div>
                              </Col>
                              <Col span={19}>
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
                            </Form.Item>
                          </Col>
                        </Row>
                      </Col>
                    </Row>
                  </Card>
                </Col>
              </Row>
            </Col>
          </Row>
        )}
      </Form>
    </FeatureFlag>
  );
};

export default AddUser;
