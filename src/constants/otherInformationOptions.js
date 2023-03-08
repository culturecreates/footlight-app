import { Translation } from 'react-i18next';
export const otherInformationFieldNames = {
  contact: 'contact',
  performerWrap: 'performerWrap',
  supporterWrap: 'supporterWrap',
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
  {
    type: 'performers',
    fieldNames: otherInformationFieldNames.performerWrap,
    disabled: false,
    label: <Translation>{(t) => t('dashboard.events.addEditEvent.otherInformation.performer.title')}</Translation>,
    tooltip: (
      <Translation>{(t) => t('dashboard.events.addEditEvent.otherInformation.performer.performerTooltip')}</Translation>
    ),
  },
  {
    type: 'supporter',
    fieldNames: otherInformationFieldNames.supporterWrap,
    disabled: false,
    label: <Translation>{(t) => t('dashboard.events.addEditEvent.otherInformation.supporter.title')}</Translation>,
    tooltip: (
      <Translation>{(t) => t('dashboard.events.addEditEvent.otherInformation.supporter.supporterTooltip')}</Translation>
    ),
  },
];
