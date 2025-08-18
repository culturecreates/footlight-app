import { Translation } from 'react-i18next';

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
