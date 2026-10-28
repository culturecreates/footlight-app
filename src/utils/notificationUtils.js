import { Translation } from 'react-i18next';
import { messageStatusMap } from '../constants/notificationConstants';

export const formatNotificationTime = (timestamp) => {
  const now = new Date();
  const notificationDate = new Date(timestamp);
  const diffInDays = Math.floor((now - notificationDate) / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) {
    return <Translation>{(t) => t('notification.today')}</Translation>;
  } else {
    return <Translation>{(t) => t('notification.daysAgo', { count: diffInDays })}</Translation>;
  }
};

// messageStatus is the single source of truth for read state: 'Sent' means unread.
export const isNotificationUnread = (item) => item?.messageStatus === messageStatusMap.SENT;
