import { notification } from 'antd';

export const copyText = ({ textToCopy }) => {
  navigator.clipboard.writeText(textToCopy);
  notification.success({
    key: 'copyTextNotification',
    description: 'copied to clipboard',
    placement: 'top',
    closeIcon: <></>,
    maxCount: 1,
    duration: 1,
  });
};
