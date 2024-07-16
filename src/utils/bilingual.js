//Function which returns the language key depending on the interface language

import { contentLanguage, contentLanguageKeyMap } from '../constants/contentLanguage';

export const bilingual = ({ interfaceLanguage, data }) => {
  /**
   * Retrieves bilingual data based on the interface language.
   * @param {Object} params - The parameters object.
   * @param {string} params.interfaceLanguage - Active interface language.
   * @param {Object} params.data - The data object containing multilingual content.
   * @returns {string} The string data of required content language or an empty string if no data is available.
   */

  if (!data) return '';
  if (!interfaceLanguage) interfaceLanguage = contentLanguageKeyMap[contentLanguage.ENGLISH];

  let requiredLanguageData = data[interfaceLanguage];

  if (requiredLanguageData) return requiredLanguageData;

  return Object.values(data)[0] ?? '';
};

export const contentLanguageBilingual = ({ interfaceLanguage, calendarContentLanguage, data }) => {
  /**
   * @param {Object} params - The parameters object.
   * @param {string} params.interfaceLanguage - Active interface language.
   * @param {string[]} params.calendarContentLanguage - Array of calendar content languages.
   * @param {Object} params.data - Multilingual data object.
   * @returns {string} The string data of required content language or an empty string if no data is available.
   **/

  if (!data) return '';

  let contentLanguageKey = interfaceLanguage?.toLowerCase();

  if (calendarContentLanguage.length == 1) {
    contentLanguageKey = contentLanguageKeyMap[calendarContentLanguage[0]];
  }

  if (data[contentLanguageKey] === undefined)
    for (const key in Object.values(contentLanguageKeyMap)) {
      const lanKey = contentLanguageKeyMap[key];
      if (data[lanKey] !== undefined) {
        return data[lanKey];
      }
    }

  return data[contentLanguageKey] ?? '';
};
