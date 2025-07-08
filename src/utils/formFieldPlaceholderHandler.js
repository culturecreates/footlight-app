import { contentLanguage, contentLanguageKeyMap } from '../constants/contentLanguage';

export const formFieldPlaceholderHandler = ({ interfaceLanguage, data }) => {
  /**
   * Recieves placeholder data Object form a form field and returns correct placeholder data based on the interface language.
   * @param {Object} params - The parameters object.
   * @param {string} params.interfaceLanguage - Active interface language.
   * @param {Object} params.data - The data object containing multilingual content.
   * @returns {string} The string data of required content language or an empty string if no data is available.
   */

  if (!data) return '';
  if (typeof data === 'string') return data;
  if (data == Object && Object.keys(data).length === 0) return '';
  if (!interfaceLanguage) interfaceLanguage = contentLanguageKeyMap[contentLanguage.ENGLISH];

  if (typeof data === 'object' && data[interfaceLanguage] !== undefined) return data[interfaceLanguage];

  if (
    typeof data === 'object' &&
    Object.values(data).every((val) => typeof val === 'object' && val[interfaceLanguage])
  ) {
    const result = {};
    Object.entries(data).forEach(([key, value]) => {
      result[key] = value[interfaceLanguage] || '';
    });
    return result;
  }

  return '';
};
