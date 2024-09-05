//Function which returns the language key depending on the interface language

import { contentLanguage, contentLanguageKeyMap } from '../constants/contentLanguage';
import { userLanguages } from '../constants/userLanguages';

export const bilingual = ({ interfaceLanguage, data }) => {
  /**
   * Retrieves bilingual data based on the interface language.
   * @param {Object} params - The parameters object.
   * @param {string} params.interfaceLanguage - Active interface language.
   * @param {Object} params.data - The data object containing multilingual content.
   * @returns {string} The string data of required content language or an empty string if no data is available.
   */

  if (!data) return '';
  if (data == Object && Object.keys(data).length === 0) return '';
  if (!interfaceLanguage) interfaceLanguage = contentLanguageKeyMap[contentLanguage.ENGLISH];

  let requiredLanguageData = data[interfaceLanguage];
  const availableLanguageKeys = Object.keys(data);

  if (!requiredLanguageData) {
    const foundLanguage = userLanguages.find(({ key }) => data[key?.toLowerCase()] !== undefined);
    const lanKey = foundLanguage ? foundLanguage?.key?.toLowerCase() : availableLanguageKeys[0];

    requiredLanguageData = data[lanKey];
  }

  return requiredLanguageData || '';
};

export const contentLanguageBilingual = ({ calendarContentLanguage, data, requiredLanguageKey }) => {
  /**
   * @param {Object} params - The parameters object.
   * @param {string[]} params.calendarContentLanguage - Array of calendar content languages.
   * @param {Object} params.data - Multilingual data object.
   * @param {string} params.requiredLanguagekey - Required content language. If data of any particular language is required.
   * @returns {string} The string data of required content language or an empty string if no data is available.
   **/

  let contentLanguageKey = contentLanguageKeyMap[calendarContentLanguage[0]];
  if (!data) return '';
  if (requiredLanguageKey && data[requiredLanguageKey]) {
    return data[requiredLanguageKey];
  }

  if (data[contentLanguageKey] === undefined) {
    contentLanguageKey = Object.values(contentLanguageKeyMap).find((lanKey) => data[lanKey] !== undefined);
  }

  return data[contentLanguageKey] ?? '';
};
