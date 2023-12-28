import { Translation } from 'react-i18next';
export const virtualLocationFieldNames = {
  virtualLocationName: 'virtualLocationName',
  virtualLocationOnlineLink: 'virtualLocationOnlineLink',
};
export const locationTypeOptions = [
  {
    type: 'virtualLocation',
    fieldNames: [virtualLocationFieldNames.virtualLocationName, virtualLocationFieldNames.virtualLocationOnlineLink],
    disabled: false,
    label: <Translation>{(t) => t('dashboard.events.addEditEvent.location.virtualLocation')}</Translation>,
    tooltip: <Translation>{(t) => t('dashboard.events.addEditEvent.location.virtualLocationTooltip')}</Translation>,
  },
];

export const locationType = {
  type: 'virtualLocation',
  fieldNames: [virtualLocationFieldNames.virtualLocationName, virtualLocationFieldNames.virtualLocationOnlineLink],
};
