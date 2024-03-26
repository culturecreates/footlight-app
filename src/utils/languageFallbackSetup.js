export function languageFallbackSetup({ currentCalendarData, fieldData, languageFallbacks = {}, isFieldsDirty }) {
  let results = {};
  if (!fieldData || Object.keys(languageFallbacks).length == 0) return results;

  const fallbackLiteralKeys = Object.keys(languageFallbacks);

  if (currentCalendarData.contentLanguage === 'BILINGUAL') {
    if (!Object.hasOwnProperty.call(fieldData, 'en')) {
      const fallbackInfo = fallbackLiteralKeys.find((key) => Object.hasOwnProperty.call(fieldData, key));
      const fallbackErrorHandled = fallbackInfo
        ? { key: fallbackInfo, value: fieldData[fallbackInfo] }
        : Object.keys(fieldData).length > 0
        ? { key: '?', value: fieldData[Object.keys(fieldData)[0]] }
        : { key: null, value: null };

      results['en'] = {
        tagDisplayStatus: !isFieldsDirty?.en ? true : false,
        fallbackLiteralKey: fallbackErrorHandled?.key,
        fallbackLiteralValue: fallbackErrorHandled?.value,
      };
    }

    if (!Object.hasOwnProperty.call(fieldData, 'fr')) {
      const fallbackInfo = fallbackLiteralKeys.find((key) => Object.hasOwnProperty.call(fieldData, key));
      const fallbackErrorHandled = fallbackInfo
        ? { key: fallbackInfo, value: fieldData[fallbackInfo] }
        : Object.keys(fieldData).length > 0
        ? { key: '?', value: fieldData[Object.keys(fieldData)[0]] }
        : { key: null, value: null };

      results['fr'] = {
        tagDisplayStatus: !isFieldsDirty?.fr ? true : false,
        fallbackLiteralKey: fallbackErrorHandled?.key,
        fallbackLiteralValue: fallbackErrorHandled?.value,
      };
    }
  } else if (currentCalendarData.contentLanguage === 'FRENCH') {
    if (!Object.hasOwnProperty.call(fieldData, 'fr')) {
      const fallbackInfo = fallbackLiteralKeys.find((key) => Object.hasOwnProperty.call(fieldData, key));
      const fallbackErrorHandled = fallbackInfo
        ? { key: fallbackInfo, value: fieldData[fallbackInfo] }
        : Object.keys(fieldData).length > 0
        ? { key: '?', value: fieldData[Object.keys(fieldData)[0]] }
        : { key: null, value: null };

      results['fr'] = {
        tagDisplayStatus: !isFieldsDirty?.fr ? true : false,
        fallbackLiteralKey: fallbackErrorHandled?.key,
        fallbackLiteralValue: fallbackErrorHandled?.value,
      };
    } else {
      const fallbackInfo = fallbackLiteralKeys.find((key) => Object.hasOwnProperty.call(fieldData, key));
      const fallbackErrorHandled = fallbackInfo
        ? { key: fallbackInfo, value: fieldData[fallbackInfo] }
        : Object.keys(fieldData).length > 0
        ? { key: '?', value: fieldData[Object.keys(fieldData)[0]] }
        : { key: null, value: null };

      results['fr'] = {
        tagDisplayStatus: false,
        fallbackLiteralKey: fallbackErrorHandled?.key,
        fallbackLiteralValue: fallbackErrorHandled?.value,
      };
    }
  } else {
    if (!Object.hasOwnProperty.call(fieldData, 'en')) {
      const fallbackInfo = fallbackLiteralKeys.find((key) => Object.hasOwnProperty.call(fieldData, key));
      const fallbackErrorHandled = fallbackInfo
        ? { key: fallbackInfo, value: fieldData[fallbackInfo] }
        : Object.keys(fieldData).length > 0
        ? { key: '?', value: fieldData[Object.keys(fieldData)[0]] }
        : { key: null, value: null };

      results['en'] = {
        tagDisplayStatus: !isFieldsDirty?.en ? true : false,
        fallbackLiteralKey: fallbackErrorHandled?.key,
        fallbackLiteralValue: fallbackErrorHandled?.value,
      };
    } else {
      results['en'] = {
        tagDisplayStatus: false,
        fallbackLiteralKey: '',
        fallbackLiteralValue: '',
      };
    }
  }

  return results;
}
