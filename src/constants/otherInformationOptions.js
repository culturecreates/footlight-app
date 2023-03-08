import { Translation } from 'react-i18next';
export const otherInformationFieldNames = {
  contact: 'contact',
  performerWrap: 'performerWrap',
  supporterWrap: 'supporterWrap',
  eventLink: 'eventLink',
  videoLink: 'videoLink',
  facebookLink: 'facebookLink',
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
  {
    type: 'eventLink',
    fieldNames: otherInformationFieldNames.eventLink,
    disabled: false,
    label: <Translation>{(t) => t('dashboard.events.addEditEvent.otherInformation.eventLink')}</Translation>,
    tooltip: <Translation>{(t) => t('dashboard.events.addEditEvent.otherInformation.eventLinkTooltip')}</Translation>,
  },
  {
    type: 'videoLink',
    fieldNames: otherInformationFieldNames.videoLink,
    disabled: false,
    label: <Translation>{(t) => t('dashboard.events.addEditEvent.otherInformation.videoLinks')}</Translation>,
    tooltip: <Translation>{(t) => t('dashboard.events.addEditEvent.otherInformation.videoLinkTooltip')}</Translation>,
  },
  {
    type: 'facebookLink',
    fieldNames: otherInformationFieldNames.facebookLink,
    disabled: false,
    label: <Translation>{(t) => t('dashboard.events.addEditEvent.otherInformation.facebookLink')}</Translation>,
    tooltip: (
      <Translation>{(t) => t('dashboard.events.addEditEvent.otherInformation.facebookLinkTooltip')}</Translation>
    ),
  },
];
