import React, { useState } from 'react';
import { Badge, Dropdown, List, notification, Spin } from 'antd';
import BellOutlined from '../../assets/icons/Vector.svg';
import { useGetNotificationsQuery, useMarkAsReadMutation } from '../../services/notification';
import { useParams } from 'react-router-dom';
import './notification.css';
import { bilingual } from '../../utils/bilingual';
import i18next from 'i18next';
import { formatNotificationTime } from '../../utils/notificationUtils';
import { messageStatusMap } from '../../constants/notificationConstants';
import { useTranslation } from 'react-i18next';

const POLLING_INTERVAL = 10 * 60 * 1000; // 10 minutes
const LOOKBACK_DAYS = 14;

const NotificationManager = () => {
  const { calendarId } = useParams();
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();

  const [markAsRead] = useMarkAsReadMutation();

  const {
    currentData: data,
    isLoading,
    refetch,
  } = useGetNotificationsQuery(
    { calendarId, sinceNdays: LOOKBACK_DAYS },
    {
      pollingInterval: POLLING_INTERVAL,
      skip: !calendarId,
      refetchOnMountOrArgChange: true,
    },
  );

  const notifications = data?.notifications || [];
  const unreadCount = data?.unreadCount || 0;

  const handleItemClick = async (e, item) => {
    e.preventDefault();

    try {
      if (item?.messageUrl) {
        window.open(item?.messageUrl, '_blank');
      }

      if (item?.messageStatus === messageStatusMap.SENT) {
        try {
          await markAsRead({
            calendarId,
            messageId: item.id,
          }).unwrap();

          refetch();
        } catch (error) {
          console.error('Failed to mark as read:', error);
          notification.error({
            message: 'Update Failed',
            description: 'Could not mark notification as read',
          });
        }
      }
      if (
        !item?.messageUrl &&
        (item?.messageType === 'AggregatorUpdatedEvents' || item?.messageType === 'AggregatorNewEvents')
      ) {
        notification.info({
          message: t('dashboard.topNavigation.notification.noEventsForReview'),
          placement: 'top',
          closeIcon: <></>,
          maxCount: 1,
          duration: 3,
        });
        setIsOpen(false);
      }
    } catch (error) {
      console.error('Notification click error:', error);
    }
  };

  const menu = (
    <div style={{ width: 300, maxHeight: 400, overflow: 'auto' }}>
      <Spin spinning={isLoading}>
        <List
          dataSource={notifications}
          renderItem={(item) => (
            <List.Item
              onClick={(e) => handleItemClick(e, item)}
              key={item.id}
              style={{
                padding: '12px',
                background: item.unread ? '#f6f9ff' : 'inherit',
                cursor: 'pointer',
              }}>
              <List.Item.Meta
                avatar={
                  <Badge
                    color={item?.messageStatus === messageStatusMap.SENT ? '#1B3DE6' : '#ffffff'}
                    style={{
                      verticalAlign: 'middle',
                    }}
                  />
                }
                title={
                  <span
                    style={{
                      fontWeight: 700,
                      fontStyle: 'Bold',
                      fontSize: '16px',
                      leadingTrim: 'NONE',
                      lineHeight: '24px',
                      letterSpacing: '0%',
                    }}>
                    {bilingual({ interfaceLanguage: i18next.language, data: item?.content })}{' '}
                  </span>
                }
                description={
                  <>
                    <div>{item.message}</div>
                    <small style={{ color: '#888' }}>{formatNotificationTime(item?.messageTime)}</small>
                  </>
                }
              />
            </List.Item>
          )}
          locale={{ emptyText: 'No new notifications' }}
        />
      </Spin>
    </div>
  );

  return (
    <Dropdown
      dropdownRender={() => menu}
      trigger={['click']}
      overlayClassName="notification-dropdown"
      open={isOpen}
      onOpenChange={(visible) => {
        setIsOpen(visible);
        if (visible) refetch();
      }}
      placement="bottomRight">
      <Badge
        count={unreadCount}
        overflowCount={15}
        style={{
          cursor: 'pointer',
          marginRight: 24,
          backgroundColor: '#1B3DE6',
        }}>
        <img src={BellOutlined} alt="Notifications" style={{ width: 24, height: 24 }} />
      </Badge>
    </Dropdown>
  );
};

export default NotificationManager;
