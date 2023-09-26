import { notification } from 'antd';
import { Translation } from 'react-i18next';

export const copyText = ({ textToCopy }) => {
  navigator.clipboard.writeText(textToCopy);
  notification.success({
    key: 'copyTextNotification',
    description: <Translation>{(t) => t('dashboard.settings.userManagement.tooltip.modal.copyText')}</Translation>,
    placement: 'top',
    closeIcon: <></>,
    maxCount: 1,
    duration: 1,
  });
};
