import React from 'react';
import { useGetNotificationsQuery } from '../../../../services/notification';
import { useOutletContext, useParams } from 'react-router-dom';
import { Typography, Spin, Row, Col, Card } from 'antd';
import { useTranslation } from 'react-i18next';
import { messageTypeMap } from '../../../../constants/notificationConstants';
import { bilingual } from '../../../../utils/bilingual';
import i18next from 'i18next';
import moment from 'moment';
import { useSelector } from 'react-redux';
import { getUserDetails } from '../../../../redux/reducer/userSlice';
import './systemUpdates.css';

const { Title, Text } = Typography;

const SystemUpdates = () => {
  const { calendarId } = useParams();
  const { user } = useSelector(getUserDetails);

  const isSuperAdmin = !user?.role?.length;

  const { t } = useTranslation();
  const [
    currentCalendarData, // eslint-disable-next-line no-unused-vars
    _pageNumber, // eslint-disable-next-line no-unused-vars
    _setPageNumber, // eslint-disable-next-line no-unused-vars
    _getCalendar,
    setContentBackgroundColor,
  ] = useOutletContext();

  setContentBackgroundColor('#F9FAFF');

  const { timezone } = currentCalendarData;

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

  return (
    <div className="system-updates-container" style={{ padding: '24px' }}>
      <Title level={2} className="system-updates-title" style={{ marginBottom: '32px' }}>
        {t('notification.systemUpdates.title')}
      </Title>

      {isLoading ? (
        <Spin size="large" />
      ) : notifications.length === 0 ? (
        <Text type="secondary">{t('notification.systemUpdates.empty')}</Text>
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
                      <div className="update-description" style={{ fontWeight: 400 }}>
                        <Text>{bilingual({ interfaceLanguage, data: notification?.messageDescription })}</Text>
                      </div>
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
