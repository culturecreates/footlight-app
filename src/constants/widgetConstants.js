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
  },
];
