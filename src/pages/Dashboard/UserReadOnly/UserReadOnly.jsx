import React, { useEffect, useRef, useState } from 'react';
import ReadOnlyProtectedComponent from '../../../layout/ReadOnlyProtectedComponent';
import OutlinedButton from '../../..//components/Button/Outlined';
import { useTranslation } from 'react-i18next';
import { useNavigate, useOutletContext, useParams } from 'react-router-dom';
import { Button, Card, Col, Row } from 'antd';
import { LeftOutlined } from '@ant-design/icons';
import './userReadOnly.css';
import { useGetUserByIdQuery } from '../../../services/users';
import StatusTag from '../../../components/Tags/UserStatus/StatusTag';
import { roleHandler } from '../../../utils/roleHandler';
import { EnvironmentOutlined } from '@ant-design/icons';
import { copyText } from '../../../utils/copyText';
import { contentLanguageBilingual } from '../../../utils/bilingual';
import { useSelector } from 'react-redux';
import { getUserDetails } from '../../../redux/reducer/userSlice';
import FeatureFlag from '../../../layout/FeatureFlag/FeatureFlag';
import { featureFlags } from '../../../utils/featureFlags';
import { PathName } from '../../../constants/pathName';
import CalendarSelect from '../../../components/List/User/CalenderSelect/CalendarSelect';
import { userActivityStatus } from '../../../constants/userActivityStatus';

const UserReadOnly = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const timestampRef = useRef(Date.now()).current;
  const { userId, calendarId } = useParams();
  const [currentCalendarData] = useOutletContext();
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
              <div className="user-read-only-info-label">{t(`dashboard.settings.userReadOnly.${infoType}`)}</div>
            </Col>
          </Row>
          <Row>
            <Col
              className={`user-read-only-info-data ${isCopiableText && 'user-read-only-info-copiable'}`}
              onClick={onClick}>
              <div>{infoText}</div>
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
              <Col span={24} style={{ paddingRight: '0' }}>
                <Row>
                  <Col flex="auto">
                    <div className="breadcrumb-container">
                      <Button type="link" onClick={() => navigate(-2)}>
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
                            label={t('dashboard.settings.userReadOnly.editBtn')}
                            size="middle"
                            style={{ height: '40px' }}
                            onClick={() =>
                              navigate(
                                `${PathName.Dashboard}/${calendarId}${PathName.Settings}${PathName.UserManagement}${PathName.AddUser}`,
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
                      <h1>{userInfo?.firstName + ' ' + userInfo?.lastName}</h1>
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
                      <h2 className="user-info-details-card-heading">{t('dashboard.settings.userReadOnly.details')}</h2>
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
                        <h2 className="user-info-details-card-heading">
                          {t('dashboard.settings.userReadOnly.calendarAccess')}
                        </h2>
                      </Col>
                    </Row>
                    <Row>
                      {userSubscribedCalenders?.map((item, index) => {
                        return (
                          <CalendarSelect
                            key={index}
                            icon={
                              item?.image?.uri ? (
                                <div style={{ height: '40px', width: '40px' }}>
                                  <img
                                    style={{ objectFit: 'cover', height: '100%', width: '100%' }}
                                    src={item.image.uri}
                                  />
                                </div>
                              ) : (
                                <EnvironmentOutlined style={{ color: '#607EFC' }} />
                              )
                            }
                            name={contentLanguageBilingual({
                              en: item?.name?.en,
                              fr: item?.name?.fr,
                              interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
                              calendarContentLanguage: calendarContentLanguage,
                            })}
                            calenderItem={item}
                            user={false} // to hide leave button
                            itemWidth="423px"
                            bordered
                            calendarContentLanguage={calendarContentLanguage}
                          />
                        );
                      })}
                    </Row>
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
