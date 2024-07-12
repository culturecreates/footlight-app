//Function which returns the language key depending on the interface language

import { contentLanguage, contentLanguageKeyMap } from '../constants/contentLanguage';

export const bilingual = ({ fr, en, interfaceLanguage: interfaceLanguage }) => {
  if (interfaceLanguage?.toLowerCase() === 'fr' && fr) return fr;
  else if (interfaceLanguage?.toLowerCase() === 'en' && en) return en;
  else if (fr && !en) return fr;
  else return en;
};

export const contentLanguageBilingual = ({ interfaceLanguage: interfaceLanguage, calendarContentLanguage, data }) => {
  /**
   * @param {Object} params - The parameters object.
   * @param {string} params.interfaceLanguage - The language of the interface.
   * @param {string[]} params.calendarContentLanguage - Array of calendar content languages.
   * @param {Object} params.data - The data object containing content for different languages.
   * @returns {string} The content language key or an empty string if no data is available.
   */
  if (!data) return '';

  let contentLanguageKey = interfaceLanguage?.toLowerCase();

  if (calendarContentLanguage.length == 1) {
    contentLanguageKey = contentLanguageKeyMap[calendarContentLanguage[0]];
  }

  const languageKeysOfData = Object.keys(data);
  const defaultKey =
    languageKeysOfData.length > 0 ? languageKeysOfData[0] : contentLanguageKeyMap[contentLanguage.ENGLISH];

  return data[contentLanguageKey] ?? data[defaultKey];
};
