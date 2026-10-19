import React, { useState } from 'react';
import { Badge, Button, Dropdown, List, notification, Spin } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import BellOutlined from '../../assets/icons/Vector.svg';
import {
  useGetNotificationsQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
  useDeleteNotificationMutation,
} from '../../services/notification';
import { useNavigate, useParams } from 'react-router-dom';
import { PathName } from '../../constants/pathName';
import './notification.css';
import { bilingual } from '../../utils/bilingual';
import i18next from 'i18next';
import moment from 'moment';
import { messageTypeMap } from '../../constants/notificationConstants';
import { useTranslation } from 'react-i18next';
import { isNotificationUnread } from '../../utils/notificationUtils';

const POLLING_INTERVAL = 10 * 60 * 1000; // 10 minutes
const LOOKBACK_DAYS = 14;

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/;

// Produces a human-readable string for a changed field value which may be a
// string (plain text / ISO date), a number, an array, or a nested object.
const formatChangedFieldValue = (value) => {
  if (value === null || value === undefined || value === '') return '';

  if (typeof value === 'string') {
    if (ISO_DATE_REGEX.test(value)) {
      const parsed = moment.parseZone(value).locale(i18next.language);
      return parsed.isValid() ? parsed.format('DD MMM YYYY, h:mm A') : value;
    }
    return value;
  }

  if (typeof value === 'number' || typeof value === 'boolean') return String(value);

  if (Array.isArray(value)) {
    return value
      .map((item) => formatChangedFieldValue(item))
      .filter(Boolean)
      .join(', ');
  }

  if (typeof value === 'object') {
    // Multilingual object (e.g. { en, fr })
    const bilingualValue = bilingual({ interfaceLanguage: i18next.language, data: value });
    if (typeof bilingualValue === 'string' && bilingualValue) return bilingualValue;

    if (Array.isArray(value.additionalType) && value.additionalType.length > 0) {
      return value.additionalType.join(', ');
    }

    const nameValue = value.name ?? value.place?.name;
    if (nameValue) {
      const resolvedName =
        typeof nameValue === 'string' ? nameValue : bilingual({ interfaceLanguage: i18next.language, data: nameValue });
      if (typeof resolvedName === 'string') return resolvedName;
    }
  }

  return '';
};

const ChangedFieldsList = ({ changedFields }) => {
  const fields = Array.isArray(changedFields) ? changedFields : [];

  if (fields.length === 0) return null;

  return (
    <div className="notification-changed-fields">
      {fields.map((field, fieldIndex) => {
        const label = bilingual({ interfaceLanguage: i18next.language, data: field?.label }) || field?.fieldName;
        const valueText = formatChangedFieldValue(field?.value);
        return (
          <div className="notification-changed-field-line" key={field?.fieldName ?? fieldIndex}>
            <span className="notification-changed-field-label">{label}</span>
            {valueText && <span className="notification-changed-field-value">{valueText}</span>}
          </div>
        );
      })}
    </div>
  );
};

// Artsdata change values are per-language literals ({ value, language }). Prefer the
// interface language, then fall back to every value so nothing is silently hidden.
const formatArtsdataValues = (values) => {
  const list = Array.isArray(values) ? values.filter((item) => item?.value !== undefined && item?.value !== '') : [];
  if (list.length === 0) return '';

  const inInterfaceLanguage = list.filter((item) => item?.language === i18next.language);
  const selected = inInterfaceLanguage.length > 0 ? inInterfaceLanguage : list;
  return selected.map((item) => formatChangedFieldValue(item.value)).join(', ');
};

const ArtsdataChangesList = ({ changes }) => {
  const { t } = useTranslation();
  const list = Array.isArray(changes) ? changes : [];

  if (list.length === 0) return null;

  return (
    <div className="notification-changed-fields">
      {list.map((change, changeIndex) => {
        const label = bilingual({ interfaceLanguage: i18next.language, data: change?.label }) || change?.property;
        const removedText = formatArtsdataValues(change?.removed);
        const addedText = formatArtsdataValues(change?.added);
        return (
          <div className="notification-changed-field-line" key={`${change?.property}-${changeIndex}`}>
            <span className="notification-changed-field-label">{label}</span>
            <span className="notification-artsdata-change">
              {removedText && <span className="notification-artsdata-removed">{removedText}</span>}
              {removedText && addedText && <span className="notification-artsdata-arrow">→</span>}
              {addedText ? (
                <span className="notification-artsdata-added">{addedText}</span>
              ) : (
                <span className="notification-artsdata-cleared">
                  {t('dashboard.topNavigation.notification.artsdataChanges.valueRemoved')}
                </span>
              )}
            </span>
          </div>
        );
      })}
    </div>
  );
};

const NotificationManager = () => {
  const { calendarId } = useParams();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();

  const [markAsRead] = useMarkAsReadMutation();
  const [markAllAsRead, { isLoading: isMarkingAll }] = useMarkAllAsReadMutation();
  const [deleteNotification, { isLoading: isDeleting }] = useDeleteNotificationMutation();

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

  // Flatten AggregatorUpdatedEvents messages so every updated event becomes its own list entry.
  const displayItems = notifications.flatMap((item) => {
    if (item?.messageType === messageTypeMap.AGGREGATOR_UPDATED_EVENTS && item?.updatedEvents?.length > 0) {
      return item.updatedEvents.map((event, index) => ({
        key: `${item.id}-${event?.id ?? index}`,
        parentId: item.id,
        messageStatus: item.messageStatus,
        messageTime: item.messageTime,
        messageType: item.messageType,
        isEventItem: true,
        event,
      }));
    }
    // Same for ArtsdataEventChanges: one entry per changed event.
    if (item?.messageType === messageTypeMap.ARTSDATA_EVENT_CHANGES && item?.changedEvents?.length > 0) {
      return item.changedEvents.map((event, index) => ({
        key: `${item.id}-${event?.id ?? index}`,
        parentId: item.id,
        messageStatus: item.messageStatus,
        messageTime: item.messageTime,
        messageType: item.messageType,
        isArtsdataChangeItem: true,
        event,
      }));
    }
    return [
      {
        key: item.id,
        parentId: item.id,
        messageStatus: item.messageStatus,
        messageTime: item.messageTime,
        messageType: item.messageType,
        messageUrl: item.messageUrl,
        content: item.content,
        message: item.message,
        updatedEvents: item.updatedEvents,
        isEventItem: false,
      },
    ];
  });

  const markItemAsRead = async (messageId) => {
    if (!messageId) return;
    try {
      await markAsRead({ calendarId, messageId }).unwrap();
      refetch();
    } catch (error) {
      console.error('Failed to mark as read:', error);
      notification.error({
        message: 'Update Failed',
        description: 'Could not mark notification as read',
      });
    }
  };

  const handleMarkAllAsRead = async () => {
    const unreadIds = notifications
      .filter(isNotificationUnread)
      .map((item) => item?.id)
      .filter(Boolean);

    if (unreadIds.length === 0) return;

    try {
      await markAllAsRead({ calendarId, messageIds: unreadIds }).unwrap();
      refetch();
    } catch (error) {
      console.error('Failed to mark all as read:', error);
      notification.error({
        message: 'Update Failed',
        description: 'Could not mark all notifications as read',
      });
    }
  };

  const handleDelete = async (e, item) => {
    e.preventDefault();
    e.stopPropagation();
    if (!item?.parentId || isDeleting) return;

    try {
      await deleteNotification({ calendarId, messageId: item.parentId }).unwrap();
      refetch();
    } catch (error) {
      console.error('Failed to delete notification:', error);
      notification.error({
        message: 'Update Failed',
        description: 'Could not delete notification',
      });
    }
  };

  const handleItemClick = async (e, item) => {
    e.preventDefault();

    try {
      if (item?.isEventItem) {
        if (item?.event?.uri) {
          window.open(item.event.uri, '_blank', 'noopener,noreferrer');
        }
        if (isNotificationUnread(item)) {
          await markItemAsRead(item.parentId);
        }
        return;
      }

      // Open the CMS copy of the event in-app rather than following cmsUrl, which is
      // an absolute URL tied to one deployment.
      if (item?.isArtsdataChangeItem) {
        if (item?.event?.id) {
          setIsOpen(false);
          navigate(`${PathName.Dashboard}/${calendarId}${PathName.Events}/${item.event.id}`);
        }
        if (isNotificationUnread(item)) {
          await markItemAsRead(item.parentId);
        }
        return;
      }

      if (item?.messageUrl) {
        window.open(item?.messageUrl, '_blank');
      }

      if (isNotificationUnread(item)) {
        await markItemAsRead(item.parentId);
      }
      if (
        !item?.messageUrl &&
        !(item?.updatedEvents?.length > 0) &&
        (item?.messageType === messageTypeMap.AGGREGATOR_UPDATED_EVENTS ||
          item?.messageType === messageTypeMap.AGGREGATOR_NEW_EVENTS)
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
    <div className="notification-dropdown-panel">
      <div className="notification-dropdown-header">
        <span className="notification-dropdown-title">{t('dashboard.topNavigation.notification.title')}</span>
        <Button
          type="primary"
          className="notification-mark-all-button"
          disabled={unreadCount === 0}
          loading={isMarkingAll}
          onClick={handleMarkAllAsRead}>
          {t('dashboard.topNavigation.notification.markAllAsRead')}
        </Button>
      </div>
      <Spin spinning={isLoading}>
        <div className="notification-dropdown-list">
          <List
            dataSource={displayItems}
            renderItem={(item) => {
              const isEventItem = item?.isEventItem;
              const isArtsdataChangeItem = item?.isArtsdataChangeItem;
              const eventName =
                (isEventItem || isArtsdataChangeItem) &&
                (bilingual({ interfaceLanguage: i18next.language, data: item?.event?.name }) ||
                  t('dashboard.topNavigation.notification.updatedEvents.eventLabel'));

              let messageText;
              if (isEventItem) {
                messageText = t('dashboard.topNavigation.notification.sourceEventUpdated', { name: eventName });
              } else if (isArtsdataChangeItem) {
                messageText = t('dashboard.topNavigation.notification.artsdataChanges.title', { name: eventName });
              } else {
                messageText = bilingual({ interfaceLanguage: i18next.language, data: item?.content }) || item?.message;
              }

              const notificationDate = moment.parseZone(item?.messageTime).locale(i18next.language);
              const dateText = notificationDate.isValid() ? notificationDate.format('MMMM DD, YYYY') : '';
              const showToday = notificationDate.isValid() && notificationDate.isSame(moment(), 'day');

              return (
                <List.Item
                  onClick={(e) => handleItemClick(e, item)}
                  key={item.key}
                  className={`notification-item${isNotificationUnread(item) ? ' notification-item-unread' : ''}`}>
                  <div className="notification-item-date">
                    <div className="notification-item-date-row">
                      {isNotificationUnread(item) && <span className="notification-item-unread-dot" />}
                      <span className="notification-item-date-value">{dateText}</span>
                    </div>
                    {showToday && <span className="notification-item-today">{t('notification.today')}</span>}
                  </div>
                  <div className="notification-item-content">
                    <div className="notification-item-message">{messageText}</div>
                    {isEventItem && <ChangedFieldsList changedFields={item?.event?.changedFields} />}
                    {isArtsdataChangeItem && (
                      <>
                        <ArtsdataChangesList changes={item?.event?.changes} />
                        <div className="notification-artsdata-meta">
                          {item?.event?.editedInCms && (
                            <span className="notification-artsdata-edited-tag">
                              {t('dashboard.topNavigation.notification.artsdataChanges.editedInCms')}
                            </span>
                          )}
                          {item?.event?.artsdataUri && (
                            <a
                              className="notification-artsdata-link"
                              href={item.event.artsdataUri}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}>
                              {t('dashboard.topNavigation.notification.artsdataChanges.viewInArtsdata')}
                            </a>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                  <div className="notification-item-actions">
                    <button
                      type="button"
                      className="notification-item-delete"
                      aria-label={t('dashboard.topNavigation.notification.deleteLabel')}
                      disabled={isDeleting}
                      onClick={(e) => handleDelete(e, item)}>
                      <DeleteOutlined />
                    </button>
                  </div>
                </List.Item>
              );
            }}
            locale={{ emptyText: t('dashboard.topNavigation.notification.empty') }}
          />
        </div>
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
