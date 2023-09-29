import { Translation } from 'react-i18next';

export const userActivityStatus = [
  {
    label: <Translation>{(t) => t('dashboard.settings.userManagement.active')}</Translation>,
    key: 'ACTIVE',
  },
  {
    label: <Translation>{(t) => t('dashboard.settings.userManagement.inActive')}</Translation>,
    key: `INACTIVE`,
  },
  {
    label: <Translation>{(t) => t('dashboard.settings.userManagement.invite')}</Translation>,
    key: 'INVITED',
  },
];
