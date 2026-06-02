import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import ReadOnlyProtectedComponent from '../../../layout/ReadOnlyProtectedComponent';
import OutlinedButton from '../../..//components/Button/Outlined';
import { useTranslation } from 'react-i18next';
import { useNavigate, useOutletContext, useParams } from 'react-router-dom';
import { Button, Card, Col, Form, Row } from 'antd';
import { LeftOutlined, UserOutlined } from '@ant-design/icons';
import './userReadOnly.css';
import { useGetUserByIdQuery, useGetCurrentUserQuery } from '../../../services/users';
import StatusTag from '../../../components/Tags/UserStatus/StatusTag';
import { copyText } from '../../../utils/copyText';
import { contentLanguageBilingual } from '../../../utils/bilingual';
import { useSelector } from 'react-redux';
import { getUserDetails } from '../../../redux/reducer/userSlice';
import FeatureFlag from '../../../layout/FeatureFlag/FeatureFlag';
import { featureFlags } from '../../../utils/featureFlags';
import { PathName } from '../../../constants/pathName';
import { userActivityStatus } from '../../../constants/userActivityStatus';
import CalendarAccordion from '../../../components/Accordion/CalendarAccordion';
import LoadingIndicator from '../../../components/LoadingIndicator/LoadingIndicator';
import ProfileImageUpload from '../../../components/ProfileImageUpload/ProfileImageUpload';

const UserReadOnly = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const timestampRef = useRef(Date.now()).current;
  const stickyHeaderRef = useRef(null);
  const { userId, calendarId } = useParams();
  const [
    currentCalendarData, // eslint-disable-next-line no-unused-vars
    _pageNumber, // eslint-disable-next-line no-unused-vars
    _setPageNumber, // eslint-disable-next-line no-unused-vars
    _getCalendar,
    setContentBackgroundColor,
  ] = useOutletContext();
  const { user, accessToken } = useSelector(getUserDetails);

  useEffect(() => {
    setContentBackgroundColor('#F9FAFF');
  }, [setContentBackgroundColor]);

  const [userSubscribedCalenders, setUserSubscribedCalenders] = useState();

  const calendarContentLanguage = currentCalendarData?.contentLanguage;

  const isCurrentUser = userId === user?.id;

  const {
    data: userByIdData,
    isSuccess: userByIdSuccess,
    isLoading: userByIdLoading,
  } = useGetUserByIdQuery({ userId, calendarId, sessionId: timestampRef }, { skip: isCurrentUser || !userId });

  const {
    data: currentUserData,
    isSuccess: currentUserSuccess,
    isLoading: currentUserLoading,
  } = useGetCurrentUserQuery({ accessToken, calendarId }, { skip: !isCurrentUser });

  const userInfo = isCurrentUser ? currentUserData : userByIdData;
  const userSuccess = isCurrentUser ? currentUserSuccess : userByIdSuccess;
  const userLoading = isCurrentUser ? currentUserLoading : userByIdLoading;

  useLayoutEffect(() => {
    if (stickyHeaderRef.current) {
      document.documentElement.style.setProperty(
        '--user-read-only-header-height',
        `${stickyHeaderRef.current.offsetHeight}px`,
      );
    }
  });

  useEffect(() => {
    if (userSuccess) {
      const visibleCalendarStatuses = [userActivityStatus[0].key, userActivityStatus[2].key];
      const activeCalendars = userInfo?.roles?.filter((r) => visibleCalendarStatuses.includes(r.status)) ?? [];

      if (isCurrentUser) {
        setUserSubscribedCalenders(activeCalendars);
      } else {
        setUserSubscribedCalenders(activeCalendars.filter((calendar) => calendar.calendarId === calendarId));
      }
    }
  }, [calendarId, isCurrentUser, userSuccess, userInfo]);

  const profileImageUrl = userInfo?.profileImage ?? null;
  const calendarSpecificStatus = userInfo?.roles?.find((role) => role?.calendarId === calendarId)?.status;
  const displayedStatus = calendarSpecificStatus || userInfo?.userStatus;
  const fullName = [userInfo?.firstName, userInfo?.lastName].filter(Boolean).join(' ').trim();
  const headerDisplayName = fullName || userInfo?.email || userInfo?.userName || '-';

  const createUserInfoRowItem = ({ isCopiableText, infoType, infoText, onClick }) => {
    return (
      <Row gutter={[0, 4]}>
        <Col>
          <Row>
            <Col>
              <div className="user-read-only-info-label" data-cy="div-user-info-type">
                {t(`dashboard.settings.userReadOnly.${infoType}`)}
              </div>
            </Col>
          </Row>
          <Row>
            <Col
              className={`user-read-only-info-data ${isCopiableText && 'user-read-only-info-copiable'}`}
              onClick={onClick}>
              <div data-cy="div-user-info-text">{infoText}</div>
            </Col>
          </Row>
        </Col>
      </Row>
    );
  };

  return (
    <FeatureFlag isFeatureEnabled={featureFlags.settingsScreenUsers}>
      {userLoading ? (
        <div style={{ height: '500px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <LoadingIndicator />
        </div>
      ) : (
        <Row className="user-read-only-wrapper" gutter={[0, 32]}>
          <div className="user-read-only-sticky-header" ref={stickyHeaderRef}>
            <Row gutter={[32, 24]} className="user-read-only-heading-wrapper">
              <Col span={24}>
                <Row>
                  <Col flex="auto">
                    <div className="breadcrumb-container">
                      <Button type="link" onClick={() => navigate(-2)} data-cy="button-back-to-previous">
                        <LeftOutlined style={{ fontSize: '12px', paddingRight: '5px' }} />
                        {t('dashboard.settings.userReadOnly.breadcrumb')}
                      </Button>
                    </div>
                  </Col>
                  {(!userInfo?.isSuperAdmin || user?.id === userInfo?.id) && (
                    <Col flex="60px">
                      {isCurrentUser ? (
                        <div className="button-container">
                          <OutlinedButton
                            data-cy="button-user-edit"
                            label={t('dashboard.settings.userReadOnly.editBtn')}
                            size="middle"
                            style={{ height: '40px' }}
                            onClick={() =>
                              navigate(
                                `${PathName.Dashboard}/${calendarId}${PathName.Settings}${PathName.UserManagement}${PathName.AddUser}?id=${userInfo?.id}`,
                                { state: { data: userInfo } },
                              )
                            }
                          />
                        </div>
                      ) : (
                        <ReadOnlyProtectedComponent>
                          <div className="button-container">
                            <OutlinedButton
                              data-cy="button-user-edit"
                              label={t('dashboard.settings.userReadOnly.editBtn')}
                              size="middle"
                              style={{ height: '40px' }}
                              onClick={() =>
                                navigate(
                                  `${PathName.Dashboard}/${calendarId}${PathName.Settings}${PathName.UserManagement}${PathName.AddUser}?id=${userInfo?.id}`,
                                  { state: { data: userInfo } },
                                )
                              }
                            />
                          </div>
                        </ReadOnlyProtectedComponent>
                      )}
                    </Col>
                  )}
                </Row>
              </Col>
              <Col span={24}>
                <Row gutter={16}>
                  <Col>
                    <div className="read-only-user-heading">
                      <h1 data-cy="heading-user-name">{headerDisplayName}</h1>
                    </div>
                  </Col>
                  <Col className="read-only-user-status-wrapper">
                    <StatusTag activityStatus={displayedStatus} />
                  </Col>
                </Row>
              </Col>
            </Row>
          </div>
          <Col span={24}>
            <Row>
              <Col flex={'780px'}>
                <Card className="user-read-only-card" style={{ border: 'none' }}>
                  <Row wrap={false} align="top">
                    <Col flex={'423px'} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                      <Row gutter={[0, 4]}>
                        <Col>
                          <h2 className="user-info-details-card-heading" data-cy="heading-user-details-title">
                            {t('dashboard.settings.userReadOnly.details')}
                          </h2>
                        </Col>
                      </Row>
                      {userInfo?.email &&
                        createUserInfoRowItem({
                          isCopiableText: true,
                          infoType: 'email',
                          infoText: userInfo.email,
                          onClick: (e) => {
                            copyText({
                              textToCopy: e.target.textContent,
                              message: t(`common.copied`),
                            });
                          },
                        })}

                      {userInfo?.userName &&
                        createUserInfoRowItem({
                          isCopiableText: false,
                          infoType: 'userName',
                          infoText: userInfo?.userName,
                        })}

                      {userInfo?.firstName &&
                        createUserInfoRowItem({
                          isCopiableText: false,
                          infoType: 'firstName',
                          infoText: userInfo.firstName,
                        })}

                      {userInfo?.lastName &&
                        createUserInfoRowItem({
                          isCopiableText: false,
                          infoType: 'lastName',
                          infoText: userInfo.lastName,
                        })}

                      {profileImageUrl && (
                        <div>
                          <div className="user-read-only-info-label">
                            {t('dashboard.settings.addUser.profilePicture')}
                          </div>
                          <div style={{ marginTop: '4px' }}>
                            <ProfileImageUpload
                              imageUrl={profileImageUrl}
                              readOnly={true}
                              data-cy="image-user-profile-readonly"
                            />
                          </div>
                        </div>
                      )}

                      {userInfo?.interfaceLanguage &&
                        createUserInfoRowItem({
                          isCopiableText: false,
                          infoType: 'languagePreference',
                          infoText:
                            userInfo?.interfaceLanguage === 'EN' ? t('common.tabEnglish') : t('common.tabFrench'),
                        })}
                    </Col>

                    <Col style={{ paddingLeft: '24px' }}>
                      {profileImageUrl ? (
                        <img
                          src={profileImageUrl}
                          alt="profile"
                          style={{ width: '151px', height: '151px', objectFit: 'cover', borderRadius: '4px' }}
                          data-cy="image-user-profile-thumbnail"
                        />
                      ) : (
                        <div
                          style={{
                            width: '151px',
                            height: '151px',
                            borderRadius: '4px',
                            backgroundColor: '#E3E8FF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                          data-cy="image-user-profile-thumbnail-placeholder">
                          <UserOutlined style={{ color: '#607EFC', fontSize: '44px' }} />
                        </div>
                      )}
                    </Col>
                  </Row>
                </Card>
              </Col>
            </Row>
          </Col>
          {userSubscribedCalenders?.length > 0 && (
            <Col span={24}>
              <Row>
                <Col flex={'780px'}>
                  <Card className="user-read-only-calendar-card" style={{ border: 'none' }}>
                    <Row>
                      <Col>
                        <h2 className="user-info-details-card-heading" data-cy="heading-user-calendar-access-title">
                          {t('dashboard.settings.userReadOnly.calendarAccess')}
                        </h2>
                      </Col>
                    </Row>
                    <Col flex={'423px'} className="calendar-search">
                      <Row>
                        <Col flex={'423px'}>
                          <Col>
                            <Form layout="vertical">
                              <div style={{ display: 'flex', gap: '16px', flexDirection: 'column' }}>
                                {userSubscribedCalenders?.map((calendar) => {
                                  return (
                                    <CalendarAccordion
                                      readOnly={true}
                                      data-cy="accordion-selected-calendars"
                                      key={calendar?.calendarId}
                                      selectedCalendarId={calendar?.calendarId}
                                      name={contentLanguageBilingual({
                                        data: calendar?.name,
                                        interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
                                        calendarContentLanguage: calendarContentLanguage,
                                      })}
                                      role={calendar?.role}
                                      disabled={calendar?.disabled}
                                      organizationIds={calendar?.organizations}
                                      peopleIds={calendar?.people}
                                      placeIds={calendar?.places}
                                    />
                                  );
                                })}
                              </div>
                            </Form>
                          </Col>
                        </Col>
                      </Row>
                    </Col>
                  </Card>
                </Col>
              </Row>
            </Col>
          )}
        </Row>
      )}
    </FeatureFlag>
  );
};

export default UserReadOnly;
