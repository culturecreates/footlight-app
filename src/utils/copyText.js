import { notification } from 'antd';

export const copyText = async ({ textToCopy, message }) => {
  if (typeof textToCopy !== 'string' || textToCopy.trim() === '') return;

  await navigator.clipboard.writeText(textToCopy);
  notification.success({
    key: 'copyTextNotification',
    description: message,
    placement: 'top',
    closeIcon: <></>,
    maxCount: 1,
    duration: 1,
  });
};
