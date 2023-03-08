import { Translation } from 'react-i18next';

export const locationTypeOptions = [
  {
    type: 'virtualLocation',
    fieldNames: ['virtualLocationName', 'virtualLocationOnlineLink'],
    disabled: false,
    label: <Translation>{(t) => t('dashboard.events.addEditEvent.location.virtualLocation')}</Translation>,
    tooltip: <Translation>{(t) => t('dashboard.events.addEditEvent.location.virtualLocationTooltip')}</Translation>,
  },
];
