import { Translation } from 'react-i18next';

export const widgetFontCollection = [
  { label: 'Roboto', value: 'Roboto' },
  { label: 'Open Sans', value: 'Open Sans' },
  { label: 'Lato', value: 'Lato' },
  { label: 'Montserrat', value: 'Montserrat' },
  { label: 'Merriweather', value: 'Merriweather' },
  { label: 'Poppins', value: 'Poppins' },
  { label: 'Nunito', value: 'Nunito' },
  { label: 'Raleway', value: 'Raleway' },
  { label: 'Helvetica', value: 'Helvetica' },
];

export const redirectionModes = [
  {
    label: <Translation>{(t) => t('dashboard.settings.widgetSettings.redirectionModeNone')}</Translation>,
    value: 'NONE',
  },
  {
    label: <Translation>{(t) => t('dashboard.settings.widgetSettings.redirectionModeExternal')}</Translation>,
    value: 'EXTERNAL',
    disabled: true,
  },
];

export const filterOptions = [
  {
    label: <Translation>{(t) => t('dashboard.settings.widgetSettings.date')}</Translation>,
    value: 'DATES',
    disabled: true,
  },
  {
    label: <Translation>{(t) => t('dashboard.settings.widgetSettings.eventType')}</Translation>,
    value: 'EVENT_TYPE',
  },
  {
    label: <Translation>{(t) => t('dashboard.settings.widgetSettings.audience')}</Translation>,
    value: 'AUDIENCE',
  },
  {
    label: <Translation>{(t) => t('dashboard.settings.widgetSettings.place')}</Translation>,
    value: 'PLACE',
  },
];
