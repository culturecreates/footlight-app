import React, { useEffect, useRef, useState } from 'react';
import ReadOnlyProtectedComponent from '../../../layout/ReadOnlyProtectedComponent';
import OutlinedButton from '../../..//components/Button/Outlined';
import { useTranslation } from 'react-i18next';
import { useNavigate, useOutletContext, useParams } from 'react-router-dom';
import { Button, Card, Col, Form, Row } from 'antd';
import { LeftOutlined } from '@ant-design/icons';
import './userReadOnly.css';
import { useGetUserByIdQuery } from '../../../services/users';
import StatusTag from '../../../components/Tags/UserStatus/StatusTag';
import { roleHandler } from '../../../utils/roleHandler';
import { copyText } from '../../../utils/copyText';
import { contentLanguageBilingual } from '../../../utils/bilingual';
import { useSelector } from 'react-redux';
import { getUserDetails } from '../../../redux/reducer/userSlice';
import FeatureFlag from '../../../layout/FeatureFlag/FeatureFlag';
import { featureFlags } from '../../../utils/featureFlags';
import { PathName } from '../../../constants/pathName';
import { userActivityStatus } from '../../../constants/userActivityStatus';
import CalendarAccordion from '../../../components/Accordion/CalendarAccordion';

const UserReadOnly = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const timestampRef = useRef(Date.now()).current;
  const { userId, calendarId } = useParams();
  const [
    currentCalendarData, // eslint-disable-next-line no-unused-vars
    _pageNumber, // eslint-disable-next-line no-unused-vars
    _setPageNumber, // eslint-disable-next-line no-unused-vars
    _getCalendar,
    setContentBackgroundColor,
  ] = useOutletContext();
  setContentBackgroundColor('#F9FAFF');
  const { user } = useSelector(getUserDetails);

  const [userSubscribedCalenders, setUserSubscribedCalenders] = useState();

  const calendarContentLanguage = currentCalendarData?.contentLanguage;

  const {
    data: userInfo,
    isSuccess: userSuccess,
    isLoading: userLoading,
  } = useGetUserByIdQuery({ userId, calendarId, sessionId: timestampRef }, { skip: userId ? false : true });

  useEffect(() => {
    if (userSuccess) {
      const activeCalendars = userInfo?.roles.filter((r) => {
        return r.status == userActivityStatus[0].key;
      });
      setUserSubscribedCalenders(activeCalendars);
    }
  }, [userLoading]);

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
      {!userLoading && (
        <Row className="user-read-only-wrapper" gutter={[0, 32]}>
          <Col span={24}>
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
                    </Col>
                  )}
                </Row>
              </Col>
              <Col span={24}>
                <Row gutter={16}>
                  <Col>
                    <div className="read-only-user-heading">
                      <h1 data-cy="heading-user-name">{userInfo?.firstName + ' ' + userInfo?.lastName}</h1>
                    </div>
                  </Col>
                  <Col className="read-only-user-status-wrapper">
                    <StatusTag activityStatus={userInfo?.userStatus} />
                  </Col>
                </Row>
              </Col>
            </Row>
          </Col>
          <Col span={24}>
            <Row>
              <Col flex={'780px'}>
                <Card className="user-read-only-card" style={{ border: 'none' }}>
                  <Row gutter={[0, 4]}>
                    <Col>
                      <h2 className="user-info-details-card-heading" data-cy="heading-user-details-title">
                        {t('dashboard.settings.userReadOnly.details')}
                      </h2>
                    </Col>
                  </Row>
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

                  {userInfo?.phoneNumber &&
                    createUserInfoRowItem({
                      isCopiableText: true,
                      infoType: 'phoneNumber',
                      infoText: userInfo.phoneNumber,
                    })}

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

                  {userInfo?.roles &&
                    createUserInfoRowItem({
                      isCopiableText: false,
                      infoType: 'userType',
                      infoText: roleHandler({ roles: userInfo.roles, calendarId }),
                    })}

                  {userInfo?.interfaceLanguage &&
                    createUserInfoRowItem({
                      isCopiableText: false,
                      infoType: 'languagePreference',
                      infoText: userInfo?.interfaceLanguage === 'EN' ? t('common.tabEnglish') : t('common.tabFrench'),
                    })}
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
                                {userSubscribedCalenders?.map((calendar, index) => {
                                  return (
                                    <CalendarAccordion
                                      readOnly={true}
                                      // form={formInstance}
                                      data-cy="accordion-selected-calendars"
                                      key={index}
                                      selectedCalendarId={calendar?.calendarId}
                                      name={contentLanguageBilingual({
                                        en: calendar?.name?.en,
                                        fr: calendar?.name?.fr,
                                        interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
                                        calendarContentLanguage: calendarContentLanguage,
                                      })}
                                      role={calendar?.role}
                                      disabled={calendar?.disabled}
                                      organizationIds={calendar?.organizations}
                                      peopleIds={calendar?.people}
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
