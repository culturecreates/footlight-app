import React from 'react';
import { useGetNotificationsQuery } from '../../../../services/notification';
import { useParams } from 'react-router-dom';
import { Typography, Divider, Spin, Row, Col } from 'antd';
import { useTranslation } from 'react-i18next';
import { messageTypeMap } from '../../../../constants/notificationConstants';
import dayjs from 'dayjs';
import { bilingual } from '../../../../utils/bilingual';
import i18next from 'i18next';

const { Title, Text } = Typography;

const SystemUpdates = () => {
  const { calendarId } = useParams();
  const { t } = useTranslation();
  const { currentData: data, isLoading } = useGetNotificationsQuery(
    { calendarId, messageType: messageTypeMap.SYSTEM },
    { refetchOnMountOrArgChange: true },
  );

  const notifications = data?.notifications || [];
  const interfaceLanguage = i18next.language || 'en';

  const formatDate = (dateString) => {
    return dayjs(dateString).format('D MMMM YYYY');
  };

  return (
    <div className="system-updates-container">
      <Title level={2} className="system-updates-title">
        {t('notification.systemUpdates.title')}
      </Title>
      <Divider />

      {isLoading ? (
        <Spin size="large" />
      ) : notifications.length === 0 ? (
        <Text type="secondary">{t('notification.systemUpdates.empty')}</Text>
      ) : (
        <div className="updates-list">
          {notifications.map((notification) => (
            <Row key={notification.id} gutter={16} className="update-item">
              <Col xs={24} sm={6} md={5} lg={4}>
                <Text strong className="update-date">
                  {formatDate(notification.createdAt)}
                </Text>
              </Col>
              <Col xs={24} sm={18} md={19} lg={20}>
                <div className="update-content">
                  {notification.title && (
                    <Title level={4} className="update-title">
                      {bilingual({ interfaceLanguage, data: notification.title })}
                    </Title>
                  )}
                  <div className="update-description">
                    <Text strong>{t('notification.systemUpdates.descriptionLabel')}:</Text>
                    <Text>{bilingual({ interfaceLanguage, data: notification?.message })}</Text>
                  </div>
                </div>
              </Col>
              <Divider />
            </Row>
          ))}
        </div>
      )}
    </div>
  );
};

export default SystemUpdates;
