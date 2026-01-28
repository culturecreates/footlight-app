import React, { useEffect } from 'react';
import { useGetNotificationsQuery } from '../../../../services/notification';
import { useNavigate, useOutletContext, useParams } from 'react-router-dom';
import { Typography, Row, Col, Card, Grid } from 'antd';
import LoadingIndicator from '../../../../components/LoadingIndicator';
import { useTranslation } from 'react-i18next';
import { messageTypeMap } from '../../../../constants/notificationConstants';
import { bilingual } from '../../../../utils/bilingual';
import i18next from 'i18next';
import moment from 'moment';
import { useSelector } from 'react-redux';
import { getUserDetails } from '../../../../redux/reducer/userSlice';
import './systemUpdates.css';
import AddEvent from '../../../../components/Button/AddEvent';
import { PathName } from '../../../../constants/pathName';

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

const SystemUpdates = () => {
  const { calendarId } = useParams();
  const screens = useBreakpoint();
  const navigate = useNavigate();
  const { user } = useSelector(getUserDetails);
  const isSuperAdmin = user?.isSuperAdmin;
  const paddingValue = screens.md ? '24px 8px' : '16px 0px';

  const { t } = useTranslation();
  const [
    currentCalendarData, // eslint-disable-next-line no-unused-vars
    _pageNumber, // eslint-disable-next-line no-unused-vars
    _setPageNumber, // eslint-disable-next-line no-unused-vars
    _getCalendar,
    setContentBackgroundColor,
  ] = useOutletContext();

  const { timezone } = currentCalendarData;

  useEffect(() => {
    setContentBackgroundColor('#F9FAFF');
  }, [setContentBackgroundColor]);

  const { currentData: data, isLoading } = useGetNotificationsQuery(
    { calendarId, messageType: messageTypeMap.SYSTEM },
    { refetchOnMountOrArgChange: true },
  );

  const notifications = data?.notifications || [];
  const interfaceLanguage = i18next.language || 'en';

  const formatDate = (dateString) => {
    return moment.tz(dateString, timezone).locale(interfaceLanguage).format('DD-MMM-YYYY')?.toUpperCase();
  };

  const onClickHandler = (e) => {
    if (isSuperAdmin) {
      console.log('clicked on notification:', e.currentTarget);
    }
  };

  const addSystemUpdate = () => {
    navigate(`${PathName.Dashboard}/${calendarId}${PathName.Messages}${PathName.AddSystemUpdate}`);
  };

  return (
    <div className="system-updates-container" style={{ padding: paddingValue }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Title level={2} className="system-updates-title" style={{ marginBottom: '32px' }}>
          {t('notification.systemUpdates.title')}
        </Title>
        {isSuperAdmin && (
          <AddEvent
            label={t('dashboard.topNavigation.systemUpdates')}
            onClick={addSystemUpdate}
            data-cy="button-add-new-system-notification"
          />
        )}
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
          <LoadingIndicator />
        </div>
      ) : notifications.length === 0 ? (
        <Card bordered={false} className="updates-card">
          <Text type="secondary">{t('notification.systemUpdates.empty')}</Text>
        </Card>
      ) : (
        <Row className="updates-list">
          <Col span={24} flex="748px">
            <Card bordered={false} className="updates-card">
              {notifications.map((notification) => {
                return (
                  <Row
                    key={notification.id}
                    className={`update-item ${isSuperAdmin ? 'hoverable' : ''}`}
                    onClick={onClickHandler}
                    gutter={16}>
                    <div
                      style={{
                        width: '150px',
                        flexShrink: 0,
                      }}>
                      <Text strong className="update-date">
                        {formatDate(notification.messageTime)}
                      </Text>
                    </div>

                    <div style={{ flex: 1 }}>
                      {notification.messageHeading && (
                        <Title level={5} className="update-title">
                          {bilingual({ interfaceLanguage, data: notification.messageHeading })}
                        </Title>
                      )}
                      <div
                        className="update-description"
                        style={{ fontWeight: 400 }}
                        dangerouslySetInnerHTML={{
                          __html: bilingual({
                            interfaceLanguage,
                            data: notification.messageDescription,
                          }),
                        }}
                      />
                    </div>
                  </Row>
                );
              })}
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );
};

export default SystemUpdates;
