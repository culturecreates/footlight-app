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
  if (!interfaceLanguage) interfaceLanguage = contentLanguageKeyMap[contentLanguage.ENGLISH];

  let requiredLanguageData = data[interfaceLanguage];

  if (!requiredLanguageData) {
    const foundLanguage = userLanguages.find(({ key }) => data[key.toLowerCase()] !== undefined);
    const lanKey = foundLanguage.key.toLowerCase();
    requiredLanguageData = data[lanKey];
  }

  return requiredLanguageData || '';
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

  if (calendarContentLanguage?.length == 1) {
    contentLanguageKey = contentLanguageKeyMap[calendarContentLanguage[0]];
  }

  if (data[contentLanguageKey] === undefined) {
    const activeKey = Object.values(contentLanguageKeyMap).find((lanKey) => data[lanKey] !== undefined);
    return data[activeKey] ?? '';
  }

  return data[contentLanguageKey];
};
