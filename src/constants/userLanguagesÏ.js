import { Translation } from 'react-i18next';

export const userLanguages = [
  {
    label: <Translation>{(t) => t('dashboard.settings.addUser.dropDownOptions.langagePreference.en')}</Translation>,
    key: 'ENGLISH',
  },
  {
    label: <Translation>{(t) => t('dashboard.settings.addUser.dropDownOptions.langagePreference.fr')}</Translation>,
    key: `FRENCH`,
  },
];
