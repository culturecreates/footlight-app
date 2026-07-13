import { notification } from 'antd';

export const copyText = async ({ textToCopy, message }) => {
  if (typeof textToCopy !== 'string' || textToCopy.trim() === '') return;

  try {
    if (!navigator?.clipboard?.writeText) return;

    await navigator.clipboard.writeText(textToCopy);
    notification.success({
      key: 'copyTextNotification',
      description: message,
      placement: 'top',
      closeIcon: <></>,
      maxCount: 1,
      duration: 1,
    });
  } catch (error) {
    console.error('Failed to copy text to clipboard', error);
  }
};
