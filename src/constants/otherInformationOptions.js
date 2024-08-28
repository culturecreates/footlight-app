import { Translation } from 'react-i18next';

export const otherInformationFieldNames = {
  contact: 'contact',
  performerWrap: 'performerWrap',
  supporterWrap: 'supporterWrap',
  eventLink: 'eventLink',
  videoLink: 'videoLink',
  facebookLinkWrap: 'facebookLinkWrap',
  keywords: 'keywords',
  inLanguage: 'inLanguage',
  facebookLink: 'facebookLink',
};
export const otherInformationOptions = [
  {
    type: 'contact',
    fieldNames: otherInformationFieldNames.contact,
    taxonomy: false,
    disabled: false,
    label: <Translation>{(t) => t('dashboard.events.addEditEvent.otherInformation.contact.contactTitle')}</Translation>,
    tooltip: (
      <Translation>{(t) => t('dashboard.events.addEditEvent.otherInformation.contact.contactTooltip')}</Translation>
    ),
  },
  {
    type: 'performers',
    fieldNames: otherInformationFieldNames.performerWrap,
    taxonomy: false,
    disabled: false,
    label: <Translation>{(t) => t('dashboard.events.addEditEvent.otherInformation.performer.title')}</Translation>,
    tooltip: (
      <Translation>{(t) => t('dashboard.events.addEditEvent.otherInformation.performer.performerTooltip')}</Translation>
    ),
  },
  {
    type: 'supporter',
    fieldNames: otherInformationFieldNames.supporterWrap,
    taxonomy: false,
    disabled: false,
    label: <Translation>{(t) => t('dashboard.events.addEditEvent.otherInformation.supporter.title')}</Translation>,
    tooltip: (
      <Translation>{(t) => t('dashboard.events.addEditEvent.otherInformation.supporter.supporterTooltip')}</Translation>
    ),
  },
  {
    type: 'eventLink',
    fieldNames: otherInformationFieldNames.eventLink,
    taxonomy: false,
    disabled: false,
    label: <Translation>{(t) => t('dashboard.events.addEditEvent.otherInformation.eventLink')}</Translation>,
    tooltip: <Translation>{(t) => t('dashboard.events.addEditEvent.otherInformation.eventLinkTooltip')}</Translation>,
  },
  {
    type: 'videoLink',
    fieldNames: otherInformationFieldNames.videoLink,
    taxonomy: false,
    disabled: false,
    label: <Translation>{(t) => t('dashboard.events.addEditEvent.otherInformation.videoLinks')}</Translation>,
    tooltip: <Translation>{(t) => t('dashboard.events.addEditEvent.otherInformation.videoLinkTooltip')}</Translation>,
  },
  {
    type: 'facebookLink',
    fieldNames: otherInformationFieldNames.facebookLinkWrap,
    taxonomy: false,
    disabled: false,
    label: <Translation>{(t) => t('dashboard.events.addEditEvent.otherInformation.facebookLink')}</Translation>,
    tooltip: (
      <Translation>{(t) => t('dashboard.events.addEditEvent.otherInformation.facebookLinkTooltip')}</Translation>
    ),
  },
  {
    type: 'keywords',
    fieldNames: otherInformationFieldNames.keywords,
    disabled: false,
    taxonomy: false,
    label: <Translation>{(t) => t('dashboard.events.addEditEvent.otherInformation.keywords')}</Translation>,
    tooltip: <Translation>{(t) => t('dashboard.events.addEditEvent.otherInformation.keywordsTooltip')}</Translation>,
  },
  {
    type: 'inLanguage',
    fieldNames: otherInformationFieldNames.inLanguage,
    taxonomy: true,
    mappedField: otherInformationFieldNames.inLanguage,
    disabled: false,
    label: (
      <>
        <Translation>
          {(t, i18next) => (
            <>
              {t('dashboard.events.addEditEvent.otherInformation.eventLanguage1')}
              {i18next.lng == 'en' ? <></> : <br />}
              {t('dashboard.events.addEditEvent.otherInformation.eventLanguage2')}
            </>
          )}
        </Translation>
      </>
    ),
    tooltip: (
      <Translation>{(t) => t('dashboard.events.addEditEvent.otherInformation.eventLanguageTooltip')}</Translation>
    ),
  },
];
