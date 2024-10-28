import { contentLanguageKeyMap } from '../constants/contentLanguage';

/**
 * Creates a status object for language fallbacks based on the provided data.
 *
 * @param {Object} params - The parameters for the function.
 * @param {string[]} params.calendarContentLanguage - Array of languages used in the calendar.
 * @param {Object} params.fieldData - Collection of data for the field of each content languages.
 * @param {Object} [params.languageFallbacks={}] - Object containing language fallbacks.
 * @param {Object} params.isFieldsDirty - Object indicating which form fields are dirty.
 * @param {Object} params.currentActiveDataInFormFields - The current active data in the form fields. Different from fieldData as fielddata only include data from api response. No realtime update.
 *
 * @returns {Object} An object containing the fallback status for each input item.
 *
 * The returned object has the following structure:
 * {
 *   [languageKey]: {
 *     tagDisplayStatus: boolean,         // Indicates whether the tag should be displayed for the language for input item corresponding to "languageKey".
 *     fallbackLiteralKey: string,        // The key of the fallback literal used, or '?' if language of "fallbackLiteralValue" is not defined in calendar.
 *     fallbackLiteralValue: any|null     // The value of the fallback literal used, or null if none. Derived from the field data.
 *   },
 *   ...
 * }
 *
 */

export function languageFallbackStatusCreator({
  calendarContentLanguage,
  fieldData,
  languageFallbacks = {},
  isFieldsDirty,
  currentActiveDataInFormFields = {},
}) {
  let results = {};

  if (!fieldData || Object.keys(languageFallbacks).length == 0 || Object.keys(fieldData).length == 0) return results;

  calendarContentLanguage.forEach((language) => {
    const languageKey = contentLanguageKeyMap[language];

    let flag = !Object.hasOwnProperty.call(fieldData, languageKey);

    if (flag) {
      const fallbackInfo = languageFallbacks[languageKey]?.find((key) => Object.hasOwnProperty.call(fieldData, key));
      const fallbackErrorHandled = fallbackInfo
        ? { key: fallbackInfo, value: fieldData[fallbackInfo] }
        : Object.keys(fieldData).length > 0
        ? { key: '?', value: fieldData[Object.keys(fieldData)[0]] }
        : { key: null, value: null };

      results[languageKey] = {
        tagDisplayStatus: !isFieldsDirty[languageKey] ? true : false,
        fallbackLiteralKey: fallbackErrorHandled?.key,
        fallbackLiteralValue: isFieldsDirty[languageKey]
          ? currentActiveDataInFormFields[languageKey] || ''
          : fallbackErrorHandled?.value,
      };
    }
  });

  return results;
}
