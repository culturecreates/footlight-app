import { contentLanguageKeyMap } from '../constants/contentLanguage';
import { capitalizeFirstLetter } from './stringManipulations';

export const placeHolderCollectionCreator = ({
  calendarContentLanguage,
  placeholderBase, // The base key for the placeholder text translation.
  t, // i18n translation function.
  hasCommonPlaceHolder = false, // If true, the same key will be used for all languages. Default is false.
  isDataCentricPlaceholder = false, // If true, the placeholder will be data-centric.
}) => {
  let placeholderCollection = {};

  if (isDataCentricPlaceholder) {
    // If the placeholder is data-centric, placeHolderbase will be the placeholder string instead of an i18next translation.
    calendarContentLanguage?.map((language) => {
      placeholderCollection[contentLanguageKeyMap[language]] = placeholderBase || '';
    });
    return placeholderCollection;
  }

  calendarContentLanguage?.map((language) => {
    const languageTranslation = t(`common.tab${capitalizeFirstLetter(language)}`);
    if (hasCommonPlaceHolder) {
      placeholderCollection[contentLanguageKeyMap[language]] = t(placeholderBase) || '';
    } else {
      placeholderCollection[contentLanguageKeyMap[language]] =
        t(placeholderBase, { language: languageTranslation }) || '';
    }
  });
  return placeholderCollection;
};

export const isDataValid = (data) => {
  return data && Object.values(data).some((value) => value && value != '');
};

export const createInitialNamesObjectFromKeyword = (keyword, calendarContentLanguage) => {
  // for creating initial names object for each language in quick create modals
  let name = {};
  calendarContentLanguage?.forEach((language) => {
    const lanKey = contentLanguageKeyMap[language];
    name[lanKey] = keyword;
  });

  return name;
};

export const renderData = (processedData, dataCy, style = {}) =>
  processedData && (
    <p className="read-only-event-content" {...(dataCy ? { 'data-cy': dataCy } : {})} style={style}>
      {processedData}
    </p>
  );
