import { Translation } from 'react-i18next';

export const userLanguages = [
  {
    value: 'EN',
    label: <Translation>{(t) => t('dashboard.settings.addUser.dropDownOptions.langagePreference.en')}</Translation>,
    key: 'EN',
  },
  {
    value: 'FR',
    label: <Translation>{(t) => t('dashboard.settings.addUser.dropDownOptions.langagePreference.fr')}</Translation>,
    key: `FR`,
  },
];
