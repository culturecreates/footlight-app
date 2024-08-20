import { Translation } from 'react-i18next';

export const contentLanguage = {
  ENGLISH: 'ENGLISH',
  FRENCH: 'FRENCH',
  JAPANESE: 'JAPANESE',
  CHINESE: 'CHINESE',
  KOREAN: 'KOREAN',
};

export const contentLanguageKeyMap = {
  // value must be a string of length 2. This is required for removeUneditedFallbackValues function to work properly.
  [contentLanguage.ENGLISH]: 'en',
  [contentLanguage.FRENCH]: 'fr',
  [contentLanguage.JAPANESE]: 'ja',
  [contentLanguage.CHINESE]: 'zh',
  [contentLanguage.KOREAN]: 'ko',
};

export const calendarLanguages = [
  {
    value: contentLanguage.ENGLISH,
    label: <Translation>{(t) => t('dashboard.settings.addUser.dropDownOptions.langagePreference.en')}</Translation>,
  },
  {
    value: contentLanguage.FRENCH,
    label: <Translation>{(t) => t('dashboard.settings.addUser.dropDownOptions.langagePreference.fr')}</Translation>,
  },
  {
    value: contentLanguage.JAPANESE,
    label: <Translation>{(t) => t('dashboard.settings.addUser.dropDownOptions.langagePreference.ja')}</Translation>,
  },
  {
    value: contentLanguage.KOREAN,
    label: <Translation>{(t) => t('dashboard.settings.addUser.dropDownOptions.langagePreference.ko')}</Translation>,
  },
  {
    value: contentLanguage.CHINESE,
    label: <Translation>{(t) => t('dashboard.settings.addUser.dropDownOptions.langagePreference.zh')}</Translation>,
  },
];
