//Function which returns the language key depending on the interface language

import { contentLanguage, contentLanguageKeyMap } from '../constants/contentLanguage';
import { userLanguages } from '../constants/userLanguages';

export const bilingual = ({ interfaceLanguage, data }) => {
  /**
   * Retrieves bilingual data based on the interface language.
   * @param {Object} params - The parameters object.
   * @param {string} params.interfaceLanguage - Active interface language.
   * @param {Object} params.data - The data object containing multilingual content.
   * @returns {string} .
   */

  if (!data) return '';
  if (!interfaceLanguage) interfaceLanguage = contentLanguageKeyMap[contentLanguage.ENGLISH];

  const activeLanguageKey = userLanguages
    .find((lang) => {
      const langKey = lang.value.toLowerCase();
      return langKey === interfaceLanguage?.toLowerCase();
    })
    ?.key?.toLowerCase();

  let activeData = data[activeLanguageKey];

  if (!activeData) {
    const dataObjectKeys = Object.keys(data);
    return dataObjectKeys.length > 0 ? data[dataObjectKeys[0]] : '';
  }

  return activeData;
};

export const contentLanguageBilingual = ({ interfaceLanguage, calendarContentLanguage, data }) => {
  /**
   * @param {Object} params - The parameters object.
   * @param {string} params.interfaceLanguage - Active interface language.
   * @param {string[]} params.calendarContentLanguage - Array of calendar content languages.
   * @param {Object} params.data - Multilingual data object.
   * @returns {string} The data of content language or an empty string if no data is available.
   **/

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
