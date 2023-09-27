import { notification } from 'antd';

export const copyText = ({ textToCopy, message }) => {
  navigator.clipboard.writeText(textToCopy);
  notification.success({
    key: 'copyTextNotification',
    description: message,
    placement: 'top',
    closeIcon: <></>,
    maxCount: 1,
    duration: 1,
  });
};
