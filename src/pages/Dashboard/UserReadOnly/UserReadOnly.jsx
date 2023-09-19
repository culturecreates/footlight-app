import React, { useEffect, useRef, useState } from 'react';
import ReadOnlyProtectedComponent from '../../../layout/ReadOnlyProtectedComponent';
import OutlinedButton from '../../..//components/Button/Outlined';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate, useOutletContext, useParams } from 'react-router-dom';
import { Button, Card, Col, Row } from 'antd';
import { LeftOutlined } from '@ant-design/icons';
import './userReadOnly.css';
import { useGetUserByIdQuery } from '../../../services/users';
import StatusTag from '../../../components/Tags/UserStatus/StatusTag';
import { roleHandler } from '../../../utils/roleHandler';
import { EnvironmentOutlined } from '@ant-design/icons';
import { copyText } from '../../../utils/copyText';
import SelectionItem from '../../../components/List/SelectionItem';
import { useGetAllCalendarsQuery } from '../../../services/calendar';
import { contentLanguageBilingual } from '../../../utils/bilingual';
import { useSelector } from 'react-redux';
import { getUserDetails } from '../../../redux/reducer/userSlice';

const UserReadOnly = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const timestampRef = useRef(Date.now()).current;
  const { userId, calendarId } = useParams();
  const [currentCalendarData] = useOutletContext();
  const { currentUser } = useSelector(getUserDetails);

  const [userSubscribedCalenders, setUserSubscribedCalenders] = useState();

  const calendarContentLanguage = currentCalendarData?.contentLanguage;

  const {
    data: userInfo,
    isSuccess: userSuccess,
    isLoading: userLoading,
  } = useGetUserByIdQuery({ userId, calendarId, sessionId: timestampRef }, { skip: userId ? false : true });

  const {
    data: calendarData,
    isLoading: calendarLoading,
    isSuccess: calendarSuccess,
  } = useGetAllCalendarsQuery({ sessionId: timestampRef });

  useEffect(() => {
    if (calendarSuccess && userSuccess) {
      let filteredCalendarItem = [];
      const allUserSubscribedCalendarId = userInfo?.roles.map((item) => item.calendarId);

      calendarData?.data?.map((item) => {
        allUserSubscribedCalendarId.map((userSubscribedCalendarId) => {
          if (item?.id === userSubscribedCalendarId) {
            return filteredCalendarItem.push(item);
          }
        });
      });
      setUserSubscribedCalenders([...filteredCalendarItem]);
      console.log(userSubscribedCalenders);
    }
  }, [calendarLoading, userLoading]);

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
    !userLoading &&
    !calendarLoading && (
      <Row className="user-read-only-wrapper" gutter={[0, 32]}>
        <Col span={24}>
          <Row gutter={[32, 24]} className="user-read-only-heading-wrapper">
            <Col span={24} style={{ paddingRight: '0' }}>
              <Row>
                <Col flex="auto">
                  <div className="breadcrumb-container">
                    <Button type="link" onClick={() => navigate(-1)}>
                      <LeftOutlined style={{ fontSize: '12px', paddingRight: '5px' }} />
                      {t('dashboard.settings.userReadOnly.breadcrumb')}
                    </Button>
                  </div>
                </Col>
                <Col flex="60px">
                  <ReadOnlyProtectedComponent>
                    <div className="button-container">
                      <OutlinedButton
                        label={t('dashboard.settings.userReadOnly.editBtn')}
                        size="middle"
                        style={{ height: '40px', width: '112px' }}
                        onClick={() => navigate(location.pathname)}
                      />
                    </div>
                  </ReadOnlyProtectedComponent>
                </Col>
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
            <Col lg={16} sm={24} xs={24}>
              <Card className="user-read-only-card">
                <Row gutter={[0, 4]}>
                  <Col>
                    <h2 className="user-info-details-card-heading">{t('dashboard.settings.userReadOnly.details')}</h2>
                  </Col>
                </Row>
                {(userInfo?.lastName || userInfo?.firstName) &&
                  createUserInfoRowItem({
                    isCopiableText: false,
                    infoType: 'userName',
                    infoText: userInfo.firstName[0].toLowerCase() + userInfo.lastName.toLowerCase(),
                  })}

                {userInfo?.firstName &&
                  createUserInfoRowItem({ isCopiableText: false, infoType: 'firstName', infoText: userInfo.firstName })}

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
                      copyText({ textToCopy: e.target.textContent });
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
                    infoText: userInfo?.interfaceLanguage ? t('common.tabEnglish') : t('common.tabFrench'),
                  })}
              </Card>
            </Col>
          </Row>
        </Col>
        <Col span={24}>
          <Row>
            <Col lg={16} sm={24} xs={24}>
              <Card className="user-read-only-calendar-card">
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
                      <SelectionItem
                        key={index}
                        icon={<EnvironmentOutlined style={{ color: '#607EFC' }} />}
                        name={contentLanguageBilingual({
                          en: item?.name?.en,
                          fr: item?.name?.fr,
                          interfaceLanguage: currentUser?.interfaceLanguage?.toLowerCase(),
                          calendarContentLanguage: calendarContentLanguage,
                        })}
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
      </Row>
    )
  );
};

export default UserReadOnly;