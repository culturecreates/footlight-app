import { Translation } from 'react-i18next';
export const otherInformationFieldNames = {
  contact: 'contact',
};
export const otherInformationOptions = [
  {
    type: 'contact',
    fieldNames: otherInformationFieldNames.contact,
    disabled: false,
    label: <Translation>{(t) => t('dashboard.events.addEditEvent.otherInformation.contact.contactTitle')}</Translation>,
    tooltip: (
      <Translation>{(t) => t('dashboard.events.addEditEvent.otherInformation.contact.contactTooltip')}</Translation>
    ),
  },
];
