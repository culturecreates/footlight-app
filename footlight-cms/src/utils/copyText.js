import { notification } from 'antd';

export const copyText = async ({ textToCopy, message }) => {
  const copiedText = await navigator.clipboard.writeText(textToCopy);
  if (copiedText != '') {
    notification.success({
      key: 'copyTextNotification',
      description: message,
      placement: 'top',
      closeIcon: <></>,
      maxCount: 1,
      duration: 1,
    });
  }
};
